import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'inspection-completed-with-move-out-checklist-given-an-inspection-appointment-exists.feature'));

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let leaseId;
  let turnoverId;
  let inspectionId;
  let assignedToEmailFromGiven;
  let completeInspectionResponse;
  let getInspectionByIdResponse;

  const CURRENT_DATE = '2025-09-15T16:52:44.623Z';
  // One "Room: item" per line, as the Complete Inspection form sends them
  const TICKED_CHECKLIST = [
    'Entrance: Front door and lock work; all keys returned',
    'Kitchen: Sink and tap free of leaks',
    'Bedroom: Walls and ceiling free of holes and stains'
  ].join('\n');

  test(
    'Given an inspection appointment exists for the turnover, When the Inspector ticks move-out checklist items and marks the inspection complete, Then the ticked checklist items are saved with the inspection.',
    ({ given, when, then }) => {
      given('an inspection appointment exists for the turnover', async () => {
        // 1. Create Property
        const createPropertyRes = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: `Test Property ${Date.now()}`,
            address: '123 Test St',
            managerName: 'John Doe',
            managerEmail: 'john.doe@example.com',
            unitsCount: '10'
          });
        expect(createPropertyRes.statusCode).toBe(200);
        propertyId = createPropertyRes.body.id;

        // 2. Create Apartment
        const createApartmentRes = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: propertyId,
            unitNumber: `APT-${Date.now()}`,
            floorAreaSqm: '50',
            bedrooms: '1',
            status: 'Vacant'
          });
        expect(createApartmentRes.statusCode).toBe(200);
        apartmentId = createApartmentRes.body.id;

        // 3. Create a Lease and schedule its end
        const createLeaseRes = await request(app)
          .post('/api/v1/create-lease')
          .send({
            apartmentId: apartmentId,
            currentRent: '1000',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            nextActorEmail: 'ops@rentco.com',
            tenantName: 'Robin Diaz'
          });
        expect(createLeaseRes.statusCode).toBe(200);
        leaseId = createLeaseRes.body.id;
        const scheduleLeaseEndRes = await request(app)
          .post('/api/v1/schedule-lease-end')
          .send({
            id: leaseId,
            apartmentId: apartmentId,
            endDate: '2025-09-30',
            noticeDate: '2025-08-01',
            currentRent: '1000',
            nextActorEmail: 'ops@rentco.com'
          });
        expect(scheduleLeaseEndRes.statusCode).toBe(200);

        // 4. Create Turnover
        const createTurnoverRes = await request(app)
          .post('/api/v1/create-turnover')
          .send({
            leaseId: leaseId,
            apartmentId: apartmentId,
            targetReadyDate: '2025-10-15',
            propertyId: propertyId,
            nextActorEmail: 'inspections@rentco.com'
          });
        expect(createTurnoverRes.statusCode).toBe(200);
        turnoverId = createTurnoverRes.body.id;

        // 5. Schedule Inspection
        const scheduleInspectionRes = await request(app)
          .post('/api/v1/schedule-inspection')
          .send({
            turnoverId: turnoverId,
            apartmentId: apartmentId,
            scheduledAt: '2025-09-28T09:00:00.000Z',
            assignedToEmail: 'inspector1@rentco.com',
            locationNotes: 'Basement entry',
            nextActorEmail: 'tenant@ex.com'
          });
        expect(scheduleInspectionRes.statusCode).toBe(200);
        inspectionId = scheduleInspectionRes.body.id;
        assignedToEmailFromGiven = scheduleInspectionRes.body.assignedToEmail;
        expect(inspectionId).toBeDefined();
        expect(assignedToEmailFromGiven).toBe('inspector1@rentco.com');
      });

      when('the Inspector ticks move-out checklist items and marks the inspection complete', async () => {
        completeInspectionResponse = await request(app)
          .post('/api/v1/complete-inspection')
          .send({
            id: inspectionId,
            turnoverId: turnoverId,
            apartmentId: apartmentId,
            completedAt: CURRENT_DATE,
            findingsSummary: 'No damage found',
            hasDamages: 'false',
            photosUrl: 'https://pics.io/i9001-updated',
            nextActorEmail: 'pm@rentco.com',
            checklist: TICKED_CHECKLIST
          });
        expect(completeInspectionResponse.statusCode).toBe(200);
        expect(completeInspectionResponse.body.checklist).toBe(TICKED_CHECKLIST);
      });

      then('the ticked checklist items are saved with the inspection.', async () => {
        getInspectionByIdResponse = await request(app)
          .get(`/api/v1/get-inspection-by-id/${inspectionId}`);

        expect(getInspectionByIdResponse.statusCode).toBe(200);
        expect(getInspectionByIdResponse.body.id).toBe(inspectionId);
        expect(getInspectionByIdResponse.body.completedAt).toBe(CURRENT_DATE);
        expect(getInspectionByIdResponse.body.checklist).toBe(TICKED_CHECKLIST);
        expect(getInspectionByIdResponse.body.assignedToEmail).toBe(assignedToEmailFromGiven);

        const getAllInspectionsResponse = await request(app).get('/api/v1/get-all-inspections');
        expect(getAllInspectionsResponse.statusCode).toBe(200);
        const listedInspection = getAllInspectionsResponse.body.find(i => i.id === inspectionId);
        expect(listedInspection.checklist).toBe(TICKED_CHECKLIST);
      });
    }
  );
});
