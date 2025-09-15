import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'complete-work-order-given-scheduled-work-performed.feature'));

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let leaseId;
  let turnoverId;
  let renovationCaseId;
  let workOrderId;
  let response;

  const CURRENT_DATE = '2025-09-15T16:57:31.140Z'; // Used for scenario context, actual dates will be earlier

  test(
    'Given scheduled work has been performed, When the ConstrWorker reports completion with actual dates, notes and photos, Then Work Order Completed is recorded and any variances are captured.',
    ({ given, when, then }) => {
      given('scheduled work has been performed', async () => {
        // 1. Create a Property
        response = await request(app).post('/api/v1/create-property').send({
          name: 'Test Property',
          address: '123 Test St',
          managerName: 'Jane Doe',
          managerEmail: 'jane.doe@example.com',
          unitsCount: '10'
        });
        expect(response.statusCode).toBe(200);
        propertyId = response.body.id;

        // 2. Create an Apartment
        response = await request(app).post('/api/v1/create-apartment').send({
          propertyId: propertyId,
          unitNumber: '1A',
          floorAreaSqm: '50',
          bedrooms: '1',
          status: 'Occupied'
        });
        expect(response.statusCode).toBe(200);
        apartmentId = response.body.id;

        // 3. Schedule Lease End (to get a leaseId for turnover)
        response = await request(app).post('/api/v1/schedule-lease-end').send({
          id: 'lease-test-1',
          apartmentId: apartmentId,
          endDate: '2025-08-31',
          noticeDate: '2025-07-01',
          currentRent: '1200',
          nextActorEmail: 'ops@example.com'
        });
        expect(response.statusCode).toBe(200);
        leaseId = response.body.id;

        // 4. Create a Turnover
        response = await request(app).post('/api/v1/create-turnover').send({
          leaseId: leaseId,
          apartmentId: apartmentId,
          targetReadyDate: '2025-09-20',
          propertyId: propertyId,
          nextActorEmail: 'inspections@example.com'
        });
        expect(response.statusCode).toBe(200);
        turnoverId = response.body.id;

        // 5. Request Renovation Estimate (to get a renovationCaseId)
        response = await request(app).post('/api/v1/request-renovation-estimate').send({
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          requestedLevels: 'good',
          scopeNotes: 'Basic refresh',
          targetReadyDate: '2025-09-20',
          nextActorEmail: 'constr@example.com'
        });
        expect(response.statusCode).toBe(200);
        renovationCaseId = response.body.id;

        // 6. Create a Work Order
        response = await request(app).post('/api/v1/create-work-order').send({
          renovationCaseId: renovationCaseId,
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          scopeSummary: 'Paint walls, fix bathroom fan',
          materialsList: 'Paint, fan, caulk',
          accessDetails: 'Key from lockbox #101',
          nextActorEmail: 'crew@example.com'
        });
        expect(response.statusCode).toBe(200);
        workOrderId = response.body.id;

        // 7. Schedule the Work Order
        response = await request(app).post('/api/v1/schedule-work-order').send({
          id: workOrderId,
          apartmentId: apartmentId,
          startDate: '2025-09-01',
          endDate: '2025-09-05',
          crewName: 'Crew Gamma',
          assignedToEmail: 'lead@example.com',
          materialsReady: 'true',
          nextActorEmail: 'crew@example.com'
        });
        expect(response.statusCode).toBe(200);
      });

      when('the ConstrWorker reports completion with actual dates, notes and photos', async () => {
        response = await request(app).post('/api/v1/complete-work-order').send({
          id: workOrderId,
          apartmentId: apartmentId,
          actualStartDate: '2025-09-02',
          actualEndDate: '2025-09-04',
          completionNotes: 'Work completed ahead of schedule. Minor paint touch-ups done.',
          photosUrl: 'https://images.example.com/wo-completed-gamma-001',
          varianceNotes: 'Completed 1 day early due to efficient crew work.',
          nextActorEmail: 'crew@example.com'
        });
      });

      then('Work Order Completed is recorded and any variances are captured.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toEqual(workOrderId);
        expect(response.body.actualStartDate).toEqual('2025-09-02');
        expect(response.body.actualEndDate).toEqual('2025-09-04');
        expect(response.body.completionNotes).toEqual('Work completed ahead of schedule. Minor paint touch-ups done.');
        expect(response.body.photosUrl).toEqual('https://images.example.com/wo-completed-gamma-001');
        expect(response.body.varianceNotes).toEqual('Completed 1 day early due to efficient crew work.');

        // Verify by fetching the work order
        const getResponse = await request(app).get('/api/v1/get-all-work-orders');
        expect(getResponse.statusCode).toBe(200);
        const fetchedWorkOrder = getResponse.body.find(wo => wo.id === workOrderId);

        expect(fetchedWorkOrder).toBeDefined();
        expect(fetchedWorkOrder.actualStartDate).toEqual('2025-09-02');
        expect(fetchedWorkOrder.actualEndDate).toEqual('2025-09-04');
        expect(fetchedWorkOrder.completionNotes).toEqual('Work completed ahead of schedule. Minor paint touch-ups done.');
        expect(fetchedWorkOrder.photosUrl).toEqual('https://images.example.com/wo-completed-gamma-001');
        expect(fetchedWorkOrder.varianceNotes).toEqual('Completed 1 day early due to efficient crew work.');
      });
    }
  );
});