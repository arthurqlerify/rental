import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-renovation-report-given-inspection-completed-with-damages.feature'));

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let leaseId;
  let turnoverId;
  let inspectionId;
  let createRenovationReportPayload;
  let response;

  test(
    'Given an inspection has been completed and damages or issues were observed, When the Inspector itemizes damages with severity, locations and evidence, Then Damage Report Created is recorded and linked to the turnover.',
    ({ given, when, then }) => {
      given('an inspection has been completed and damages or issues were observed', async () => {
        // 1. Create a Property
        const createPropertyPayload = {
          name: "Property for DR Test",
          address: "101 Inspection Lane",
          managerName: "Alice Smith",
          managerEmail: "alice.smith@example.com",
          unitsCount: "10"
        };
        const propertyResponse = await request(app).post('/api/v1/create-property').send(createPropertyPayload);
        expect(propertyResponse.statusCode).toBe(200);
        propertyId = propertyResponse.body.id;

        // 2. Create an Apartment
        const createApartmentPayload = {
          propertyId: propertyId,
          unitNumber: "APT-DR1",
          floorAreaSqm: "75",
          bedrooms: "2",
          status: "Occupied"
        };
        const apartmentResponse = await request(app).post('/api/v1/create-apartment').send(createApartmentPayload);
        expect(apartmentResponse.statusCode).toBe(200);
        apartmentId = apartmentResponse.body.id;

        // 3. Schedule Lease End (assuming leaseId is provided by client for scheduling)
        leaseId = `lease-${crypto.randomUUID()}`;
        const scheduleLeaseEndPayload = {
          id: leaseId,
          apartmentId: apartmentId,
          endDate: "2025-09-30",
          noticeDate: "2025-08-01",
          currentRent: "1500",
          nextActorEmail: "ops@rentco.com"
        };
        await request(app).post('/api/v1/schedule-lease-end').send(scheduleLeaseEndPayload);
        // Expect 200, but not capturing the Lease object here.

        // 4. Create Turnover
        const createTurnoverPayload = {
          leaseId: leaseId,
          apartmentId: apartmentId,
          targetReadyDate: "2025-10-15",
          propertyId: propertyId,
          nextActorEmail: "inspections@rentco.com"
        };
        const turnoverResponse = await request(app).post('/api/v1/create-turnover').send(createTurnoverPayload);
        expect(turnoverResponse.statusCode).toBe(200);
        turnoverId = turnoverResponse.body.id;

        // 5. Mark Lease Ended
        const markLeaseEndedPayload = {
          id: leaseId,
          apartmentId: apartmentId,
          endDate: "2025-09-30",
          moveOutConfirmedAt: "2025-09-30T10:00:00Z",
          turnoverId: turnoverId,
          nextActorEmail: "ops@rentco.com"
        };
        await request(app).post('/api/v1/mark-lease-ended').send(markLeaseEndedPayload);
        // Expect 200

        // 6. Record Apartment Vacated
        const recordApartmentVacatedPayload = {
          id: turnoverId,
          apartmentId: apartmentId,
          vacatedAt: "2025-09-30T12:00:00Z",
          keysReturned: "true",
          notes: "Tenant moved out without issues.",
          nextActorEmail: "inspections@rentco.com"
        };
        await request(app).post('/api/v1/record-apartment-vacated').send(recordApartmentVacatedPayload);
        // Expect 200

        // 7. Schedule an Inspection
        const scheduleInspectionPayload = {
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          scheduledAt: "2025-10-01T09:00:00Z",
          assignedToEmail: "inspector.dr@example.com",
          locationNotes: "Main entrance and living room.",
          nextActorEmail: "tenant@example.com"
        };
        const inspectionResponse = await request(app).post('/api/v1/schedule-inspection').send(scheduleInspectionPayload);
        expect(inspectionResponse.statusCode).toBe(200);
        inspectionId = inspectionResponse.body.id;

        // 8. Complete the Inspection with damages observed
        const completeInspectionPayload = {
          id: inspectionId,
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          completedAt: "2025-10-01T10:30:00Z",
          findingsSummary: "Observed minor scuffs on walls, and a damaged kitchen sink faucet.",
          hasDamages: "true",
          photosUrl: "https://photos.example.com/dr_test_insp1",
          nextActorEmail: "construction@rentco.com"
        };
        await request(app).post('/api/v1/complete-inspection').send(completeInspectionPayload);
        // Expect 200
      });

      when('the Inspector itemizes damages with severity, locations and evidence', async () => {
        createRenovationReportPayload = {
          turnoverId: turnoverId,
          inspectionId: inspectionId,
          apartmentId: apartmentId,
          damageSeverity: "high",
          estimatedRepairCost: "1200",
          damageSummary: "Kitchen sink faucet broken, large scuff on living room wall.",
          nextActorEmail: "construction@rentco.com"
        };
        response = await request(app)
          .post('/api/v1/create-renovation-report')
          .send(createRenovationReportPayload);
      });

      then('Damage Report Created is recorded and linked to the turnover.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.turnoverId).toBe(turnoverId);
        expect(response.body.inspectionId).toBe(inspectionId);
        expect(response.body.apartmentId).toBe(apartmentId);
        expect(response.body.damageSeverity).toBe(createRenovationReportPayload.damageSeverity);
        expect(response.body.estimatedRepairCost).toBe(createRenovationReportPayload.estimatedRepairCost);
        expect(response.body.damageSummary).toBe(createRenovationReportPayload.damageSummary);
        expect(response.body.nextActorEmail).toBe(createRenovationReportPayload.nextActorEmail);
      });
    }
  );
});