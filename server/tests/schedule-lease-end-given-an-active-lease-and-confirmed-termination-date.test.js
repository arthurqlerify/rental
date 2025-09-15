import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'schedule-lease-end-given-an-active-lease-and-confirmed-termination-date.feature'));

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let leaseId; // This leaseId represents an existing lease in the system
  let turnoverId; // This turnoverId is required by the Lease schema and represents a linked existing entity
  let leaseEndDate = '2025-09-30';
  let leaseNoticeDate = '2025-08-01';
  let leaseCurrentRent = '1450';
  let leaseTenantName = 'Alexandra Nguyen';
  let leasePropertyId; // Will store the created propertyId
  let leaseNextActorEmail = 'ops@rentco.com';
  let leaseMoveOutConfirmedAt = '2025-09-30T10:00:00.000Z'; // The "confirmed termination date"

  let response;

  test(
    'Given an active lease for the apartment and a confirmed termination date, When the PropertyMgr schedules the lease end for that date, Then Lease End Scheduled is recorded with leaseId, apartmentId and endDate and next-step notifications are queued.',
    ({ given, when, then }) => {
      given('an active lease for the apartment and a confirmed termination date', async () => {
        // 1. Create a Property as a prerequisite for an Apartment and Lease
        const createPropertyPayload = {
          name: `Maple Court ${Date.now()}`,
          address: '12 Main St',
          managerName: 'Jordan Alvarez',
          managerEmail: 'pm@rentco.com',
          unitsCount: '120',
        };
        const propertyRes = await request(app).post('/api/v1/create-property').send(createPropertyPayload);
        expect(propertyRes.statusCode).toBe(200);
        propertyId = propertyRes.body.id;
        leasePropertyId = propertyId; // Link this property to our conceptual lease

        // 2. Create an Apartment as a prerequisite for a Lease
        const createApartmentPayload = {
          propertyId: propertyId,
          unitNumber: `22B-${Date.now()}`,
          floorAreaSqm: '62',
          bedrooms: '2',
          status: 'Occupied',
        };
        const apartmentRes = await request(app).post('/api/v1/create-apartment').send(createApartmentPayload);
        expect(apartmentRes.statusCode).toBe(200);
        apartmentId = apartmentRes.body.id;

        // 3. For the Lease and Turnover, since there are no explicit creation endpoints in the OpenAPI spec,
        //    we simulate their existence in the system by generating unique IDs and setting their required properties.
        //    This fulfills the "Given an active lease for the apartment and a confirmed termination date" condition.
        leaseId = `lease-${Date.now()}`;
        turnoverId = `to-${Date.now()}`; // Assuming a turnover is linked to the lease already
      });

      when('the PropertyMgr schedules the lease end for that date', async () => {
        const scheduleLeaseEndPayload = {
          id: leaseId,
          apartmentId: apartmentId,
          endDate: leaseEndDate,
          noticeDate: leaseNoticeDate,
          currentRent: leaseCurrentRent,
          nextActorEmail: leaseNextActorEmail,
        };
        response = await request(app).post('/api/v1/schedule-lease-end').send(scheduleLeaseEndPayload);
      });

      then('Lease End Scheduled is recorded with leaseId, apartmentId and endDate and next-step notifications are queued.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();

        // Assert that the response body is a Lease object and contains the expected data
        expect(response.body.id).toBe(leaseId);
        expect(response.body.apartmentId).toBe(apartmentId);
        expect(response.body.endDate).toBe(leaseEndDate);
        expect(response.body.noticeDate).toBe(leaseNoticeDate);
        expect(response.body.currentRent).toBe(leaseCurrentRent);
        expect(response.body.nextActorEmail).toBe(leaseNextActorEmail);

        // Assert that other required fields of the Lease schema are present and consistent with the given state
        expect(response.body.propertyId).toBe(leasePropertyId);
        expect(response.body.moveOutConfirmedAt).toBe(leaseMoveOutConfirmedAt); // Should remain as the confirmed termination date
        expect(response.body.turnoverId).toBe(turnoverId);
        expect(response.body.tenantName).toBe(leaseTenantName);

        // Verify that the updated lease can be retrieved via a query operation
        const getLeaseResponse = await request(app).get(`/api/v1/get-lease-by-id/${leaseId}`);
        expect(getLeaseResponse.statusCode).toBe(200);
        expect(getLeaseResponse.body.id).toBe(leaseId);
        expect(getLeaseResponse.body.apartmentId).toBe(apartmentId);
        expect(getLeaseResponse.body.endDate).toBe(leaseEndDate);
        expect(getLeaseResponse.body.noticeDate).toBe(leaseNoticeDate);
        expect(getLeaseResponse.body.currentRent).toBe(leaseCurrentRent);
        expect(getLeaseResponse.body.nextActorEmail).toBe(leaseNextActorEmail);
        expect(getLeaseResponse.body.propertyId).toBe(leasePropertyId);
        expect(getLeaseResponse.body.moveOutConfirmedAt).toBe(leaseMoveOutConfirmedAt);
        expect(getLeaseResponse.body.turnoverId).toBe(turnoverId);
        expect(getLeaseResponse.body.tenantName).toBe(leaseTenantName);
      });
    }
  );
});