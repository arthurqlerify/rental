import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'complete-turnover-given-final-inspection-passed-no-open-work-orders.feature'));

defineFeature(feature, test => {
  let response;
  let turnoverId;
  let apartmentId;
  let inspectionId;

  test(
    'Given the final inspection has passed and there are no open work orders, When Automation completes the turnover case, Then Turnover Completed is recorded and the apartment status becomes ready to rent and marketing is notified.',
    ({ given, when, then }) => {
      given('the final inspection has passed and there are no open work orders', async () => {
        // Create Property
        const propertyResponse = await request(app).post('/api/v1/create-property').send({
          name: 'Test Property for Turnover Completion',
          address: '123 Automation Way',
          managerName: 'Auto Manager',
          managerEmail: 'auto.manager@example.com',
          unitsCount: '5'
        });
        expect(propertyResponse.statusCode).toBe(200);
        const propertyId = propertyResponse.body.id;

        // Create Apartment
        const apartmentResponse = await request(app).post('/api/v1/create-apartment').send({
          propertyId: propertyId,
          unitNumber: 'AUTOCMPLT101',
          floorAreaSqm: '75',
          bedrooms: '2',
          status: 'Occupied'
        });
        expect(apartmentResponse.statusCode).toBe(200);
        apartmentId = apartmentResponse.body.id;

        // Schedule Lease End
        const leaseResponse = await request(app).post('/api/v1/schedule-lease-end').send({
          id: 'lease-autocmplttest-001',
          apartmentId: apartmentId,
          endDate: '2025-09-30',
          noticeDate: '2025-08-01',
          currentRent: '1500',
          nextActorEmail: 'ops@example.com'
        });
        expect(leaseResponse.statusCode).toBe(200);
        const leaseId = leaseResponse.body.id;

        // Create Turnover
        const createTurnoverResponse = await request(app).post('/api/v1/create-turnover').send({
          leaseId: leaseId,
          apartmentId: apartmentId,
          targetReadyDate: '2025-10-15',
          propertyId: propertyId,
          nextActorEmail: 'inspections@example.com'
        });
        expect(createTurnoverResponse.statusCode).toBe(200);
        turnoverId = createTurnoverResponse.body.id;

        // Mark Lease Ended
        await request(app).post('/api/v1/mark-lease-ended').send({
          id: leaseId,
          apartmentId: apartmentId,
          endDate: '2025-09-30',
          moveOutConfirmedAt: '2025-09-30T10:00:00.000Z',
          turnoverId: turnoverId,
          nextActorEmail: 'ops@example.com'
        });

        // Record Apartment Vacated
        await request(app).post('/api/v1/record-apartment-vacated').send({
          id: turnoverId,
          apartmentId: apartmentId,
          vacatedAt: '2025-09-30T12:00:00.000Z',
          keysReturned: 'true',
          notes: 'Tenant moved out cleanly.',
          nextActorEmail: 'inspections@example.com'
        });

        // Schedule Inspection
        const scheduleInspectionResponse = await request(app).post('/api/v1/schedule-inspection').send({
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          scheduledAt: '2025-10-01T09:00:00.000Z',
          assignedToEmail: 'inspector@example.com',
          locationNotes: 'Standard entry',
          nextActorEmail: 'tenant@example.com'
        });
        expect(scheduleInspectionResponse.statusCode).toBe(200);
        inspectionId = scheduleInspectionResponse.body.id;

        // Complete Inspection without damages (to ensure no open work orders)
        await request(app).post('/api/v1/complete-inspection').send({
          id: inspectionId,
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          completedAt: '2025-10-01T10:00:00.000Z',
          findingsSummary: 'No issues found.',
          hasDamages: 'false', // Crucial for "no open work orders"
          photosUrl: 'https://photos.example.com/autocmplttest-insp-001',
          nextActorEmail: 'tenant@example.com'
        });

        // Pass Final Inspection
        await request(app).post('/api/v1/pass-final-inspection').send({
          id: inspectionId,
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          passedAt: '2025-10-02T11:00:00.000Z',
          inspectorName: 'Alice Smith',
          certificateUrl: 'https://docs.example.com/autocmplttest-cert-001',
          nextActorEmail: 'tenant@example.com'
        });

        // Verify turnover state
        const initialTurnoverState = await request(app).get(`/api/v1/get-all-turnovers`);
        const currentTurnover = initialTurnoverState.body.find(t => t.id === turnoverId);
        expect(currentTurnover).toBeDefined();
        expect(currentTurnover.finalInspectionPassedAt).toBe('2025-10-02T11:00:00.000Z');
        expect(currentTurnover.openWorkOrdersCount).toBe('0');
      });

      when('Automation completes the turnover case', async () => {
        response = await request(app).post('/api/v1/complete-turnover').send({
          id: turnoverId,
          readyToRentDate: '2025-10-20', // Example date after inspection
          listingReady: 'true',
          marketingEmail: 'marketing@example.com',
          apartmentId: apartmentId,
          notes: 'Turnover successfully completed by automation.'
        });
      });

      then('Turnover Completed is recorded and the apartment status becomes ready to rent and marketing is notified.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(turnoverId);
        expect(response.body.readyToRentDate).toBe('2025-10-20');
        expect(response.body.listingReady).toBe('true');
        expect(response.body.marketingEmail).toBe('marketing@example.com');
        
        // Verify apartment status
        const allApartmentsResponse = await request(app).get('/api/v1/get-all-apartments');
        const updatedApartment = allApartmentsResponse.body.find(a => a.id === apartmentId);
        expect(updatedApartment).toBeDefined();
        expect(updatedApartment.status).toBe('Ready to Rent');
      });
    }
  );
});