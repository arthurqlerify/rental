import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'pass-final-inspection-given-renovations-complete-and-inspection-exists.feature'));

defineFeature(feature, test => {
  let response;
  let propertyId;
  let apartmentId;
  const leaseId = 'lease-finalinsp-1001'; // ID provided in ScheduleLeaseEndRequest
  let turnoverId;
  let inspectionId;

  // Consistent date for creation/completion events
  const CURRENT_DATE = '2025-09-15T16:58:13.902Z';
  const SCHEDULED_AT = '2025-09-15T10:00:00.000Z';
  const COMPLETED_AT = '2025-09-15T11:00:00.000Z';
  const PASSED_AT = CURRENT_DATE; // The moment the inspection is passed

  test(
    'Given renovation or repairs are complete and a final inspection appointment exists, When the Inspector verifies all items meet standards and no defects remain, Then Final Inspection Passed is recorded with inspector sign-off.',
    ({ given, when, then }) => {
      given('renovation or repairs are complete and a final inspection appointment exists', async () => {
        // 1. Create Property
        const createPropertyPayload = {
          name: 'Pinewood Apartments',
          address: '789 Pine Ave',
          managerName: 'Alice Johnson',
          managerEmail: 'alice@rentco.com',
          unitsCount: '50',
        };
        response = await request(app).post('/api/v1/create-property').send(createPropertyPayload);
        expect(response.statusCode).toBe(200);
        propertyId = response.body.id;

        // 2. Create Apartment
        const createApartmentPayload = {
          propertyId: propertyId,
          unitNumber: '303',
          floorAreaSqm: '80',
          bedrooms: '2',
          status: 'Vacant',
        };
        response = await request(app).post('/api/v1/create-apartment').send(createApartmentPayload);
        expect(response.statusCode).toBe(200);
        apartmentId = response.body.id;

        // 3. Schedule Lease End (implicitly creates a lease)
        const scheduleLeaseEndPayload = {
          id: leaseId,
          apartmentId: apartmentId,
          endDate: '2025-09-30',
          noticeDate: '2025-08-01',
          currentRent: '1600',
          nextActorEmail: 'ops@rentco.com',
        };
        response = await request(app).post('/api/v1/schedule-lease-end').send(scheduleLeaseEndPayload);
        expect(response.statusCode).toBe(200);
        // leaseId is already set from request

        // 4. Create Turnover
        const createTurnoverPayload = {
          leaseId: leaseId,
          apartmentId: apartmentId,
          targetReadyDate: '2025-10-15',
          propertyId: propertyId,
          nextActorEmail: 'inspections@rentco.com',
        };
        response = await request(app).post('/api/v1/create-turnover').send(createTurnoverPayload);
        expect(response.statusCode).toBe(200);
        turnoverId = response.body.id;

        // 5. Schedule Inspection
        const scheduleInspectionPayload = {
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          scheduledAt: SCHEDULED_AT,
          assignedToEmail: 'inspector1@rentco.com',
          locationNotes: 'Key in lockbox 303',
          nextActorEmail: 'inspector1@rentco.com',
        };
        response = await request(app).post('/api/v1/schedule-inspection').send(scheduleInspectionPayload);
        expect(response.statusCode).toBe(200);
        inspectionId = response.body.id;

        // 6. Complete Inspection (indicating no damages, fulfilling 'renovation complete' context)
        const completeInspectionPayload = {
          id: inspectionId,
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          completedAt: COMPLETED_AT,
          findingsSummary: 'All items inspected, no damages found. Ready for final pass.',
          hasDamages: 'false',
          photosUrl: 'https://pics.io/insp-completion-no-damages',
          nextActorEmail: 'pm@rentco.com',
        };
        response = await request(app).post('/api/v1/complete-inspection').send(completeInspectionPayload);
        expect(response.statusCode).toBe(200);
      });

      when('the Inspector verifies all items meet standards and no defects remain', async () => {
        const passFinalInspectionPayload = {
          id: inspectionId,
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          passedAt: PASSED_AT,
          inspectorName: 'A. Rivera',
          certificateUrl: 'https://docs.io/final-insp-cert-303',
          nextActorEmail: 'leasing@rentco.com', // Next actor after final inspection passes
        };
        response = await request(app).post('/api/v1/pass-final-inspection').send(passFinalInspectionPayload);
      });

      then('Final Inspection Passed is recorded with inspector sign-off.', async () => {
        // Assert the immediate response from passing the inspection
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(inspectionId);
        expect(response.body.passedAt).toBe(PASSED_AT);
        expect(response.body.inspectorName).toBe('A. Rivera');
        expect(response.body.nextActorEmail).toBe('leasing@rentco.com');

        // Verify the state by fetching the inspection
        const getInspectionResponse = await request(app).get(`/api/v1/get-inspection-by-id/${inspectionId}`);
        expect(getInspectionResponse.statusCode).toBe(200);
        expect(getInspectionResponse.body.id).toBe(inspectionId);
        expect(getInspectionResponse.body.passedAt).toBe(PASSED_AT);
        expect(getInspectionResponse.body.inspectorName).toBe('A. Rivera');
        expect(getInspectionResponse.body.nextActorEmail).toBe('leasing@rentco.com');
      });
    }
  );
});