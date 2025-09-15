import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-turnover-case-given-lease-with-end-date-and-no-turnover.feature'));

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let leaseId;
  const leaseEndDate = '2025-09-30'; // Example from Lease schema
  const targetReadyDate = '2025-10-15'; // Example from Turnover schema

  let createTurnoverResponse;

  test(
    'Given a lease has an end date scheduled and no turnover exists for that lease, When Automation creates a turnover case for the apartment, Then Turnover Created is recorded linking the lease, apartment and target dates.',
    ({ given, when, then }) => {
      given('a lease has an end date scheduled and no turnover exists for that lease', async () => {
        // 1. Create a Property
        const createPropertyPayload = {
          name: 'Central Park Residences',
          address: '100 Central Ave',
          managerName: 'Jane Doe',
          managerEmail: 'jane.doe@example.com',
          unitsCount: '50',
        };
        const propertyRes = await request(app)
          .post('/api/v1/create-property')
          .send(createPropertyPayload)
          .expect(200);
        propertyId = propertyRes.body.id;

        // 2. Create an Apartment linked to the property
        const createApartmentPayload = {
          propertyId: propertyId,
          unitNumber: 'A201',
          floorAreaSqm: '80',
          bedrooms: '2',
          status: 'Occupied',
        };
        const apartmentRes = await request(app)
          .post('/api/v1/create-apartment')
          .send(createApartmentPayload)
          .expect(200);
        apartmentId = apartmentRes.body.id;

        // 3. Schedule a Lease end for the apartment
        leaseId = `lease-${Date.now()}`; // Generate a unique lease ID
        const scheduleLeaseEndPayload = {
          id: leaseId,
          apartmentId: apartmentId,
          endDate: leaseEndDate,
          noticeDate: '2025-08-01',
          currentRent: '1800',
          nextActorEmail: 'tenant@example.com',
        };
        const leaseRes = await request(app)
          .post('/api/v1/schedule-lease-end')
          .send(scheduleLeaseEndPayload)
          .expect(200);

        // Assert that the lease was created and has an end date
        expect(leaseRes.body.id).toBe(leaseId);
        expect(leaseRes.body.apartmentId).toBe(apartmentId);
        expect(leaseRes.body.endDate).toBe(leaseEndDate);
        expect(leaseRes.body.propertyId).toBe(propertyId); // Property ID should be derived/set by backend

        // 4. Verify no turnover exists for that lease
        const allTurnoversRes = await request(app)
          .get('/api/v1/get-all-turnovers')
          .expect(200);
        const existingTurnoversForLease = allTurnoversRes.body.filter(
          (t) => t.leaseId === leaseId
        );
        expect(existingTurnoversForLease).toEqual([]);
      });

      when('Automation creates a turnover case for the apartment', async () => {
        const createTurnoverPayload = {
          leaseId: leaseId,
          apartmentId: apartmentId,
          targetReadyDate: targetReadyDate,
          propertyId: propertyId,
          nextActorEmail: 'inspections@rentco.com',
        };

        createTurnoverResponse = await request(app)
          .post('/api/v1/create-turnover')
          .send(createTurnoverPayload);
      });

      then('Turnover Created is recorded linking the lease, apartment and target dates.', async () => {
        expect(createTurnoverResponse.statusCode).toBe(200);
        expect(createTurnoverResponse.body.id).toBeDefined();
        expect(createTurnoverResponse.body.leaseId).toBe(leaseId);
        expect(createTurnoverResponse.body.apartmentId).toBe(apartmentId);
        expect(createTurnoverResponse.body.targetReadyDate).toBe(targetReadyDate);
        expect(createTurnoverResponse.body.propertyId).toBe(propertyId);

        // Verify other required fields from Turnover schema are present (populated by backend)
        expect(createTurnoverResponse.body.vacatedAt).toBeDefined();
        expect(createTurnoverResponse.body.keysReturned).toBeDefined();
        expect(createTurnoverResponse.body.readyToRentDate).toBeDefined();

        // Optional: Retrieve all turnovers and confirm the new one exists
        const allTurnoversRes = await request(app)
          .get('/api/v1/get-all-turnovers')
          .expect(200);

        const createdTurnover = allTurnoversRes.body.find(
          (t) => t.id === createTurnoverResponse.body.id
        );
        expect(createdTurnover).toBeDefined();
        expect(createdTurnover.leaseId).toBe(leaseId);
        expect(createdTurnover.apartmentId).toBe(apartmentId);
        expect(createdTurnover.targetReadyDate).toBe(targetReadyDate);
        expect(createdTurnover.propertyId).toBe(propertyId);
      });
    }
  );
});