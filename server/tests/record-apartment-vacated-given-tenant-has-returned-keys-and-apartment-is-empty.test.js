import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'record-apartment-vacated-given-tenant-has-returned-keys-and-apartment-is-empty.feature'));

const CURRENT_DATE = "2025-09-15T16:51:54.642Z";

// Creates a property, an occupied apartment, a lease and a turnover for that apartment.
const setUpTurnover = async (address) => {
  // 1. Create a Property
  const createPropertyRes = await request(app)
    .post('/api/v1/create-property')
    .send({
      name: 'Maple Court',
      address: address,
      managerName: 'Jordan Alvarez',
      managerEmail: 'pm@rentco.com',
      unitsCount: '120',
    });
  expect(createPropertyRes.statusCode).toBe(200);
  expect(createPropertyRes.body.id).toBeDefined();
  const propertyId = createPropertyRes.body.id;

  // 2. Create an Apartment
  const createApartmentRes = await request(app)
    .post('/api/v1/create-apartment')
    .send({
      propertyId: propertyId,
      unitNumber: '22B',
      floorAreaSqm: '62',
      bedrooms: '2',
      status: 'Vacant',
    });
  expect(createApartmentRes.statusCode).toBe(200);
  expect(createApartmentRes.body.id).toBeDefined();
  const apartmentId = createApartmentRes.body.id;

  // 3. Create a Lease, which makes the apartment Occupied
  const createLeaseRes = await request(app)
    .post('/api/v1/create-lease')
    .send({
      apartmentId: apartmentId,
      currentRent: '1450',
      nextActorEmail: 'ops@rentco.com',
      tenantName: 'Alex Morgan',
    });
  expect(createLeaseRes.statusCode).toBe(200);
  expect(createLeaseRes.body.id).toBeDefined();

  // 4. Schedule Lease End
  const scheduleLeaseEndRes = await request(app)
    .post('/api/v1/schedule-lease-end')
    .send({
      id: createLeaseRes.body.id,
      apartmentId: apartmentId,
      endDate: '2025-09-30',
      noticeDate: '2025-08-01',
      currentRent: '1450',
      nextActorEmail: 'ops@rentco.com',
    });
  expect(scheduleLeaseEndRes.statusCode).toBe(200);
  expect(scheduleLeaseEndRes.body.id).toBe(createLeaseRes.body.id);
  const leaseId = scheduleLeaseEndRes.body.id;

  // 5. Create a Turnover in its initial state
  const createTurnoverRes = await request(app)
    .post('/api/v1/create-turnover')
    .send({
      leaseId: leaseId,
      apartmentId: apartmentId,
      targetReadyDate: '2025-10-15',
      propertyId: propertyId,
      nextActorEmail: 'inspections@rentco.com',
    });
  expect(createTurnoverRes.statusCode).toBe(200);
  expect(createTurnoverRes.body.id).toBeDefined();
  const turnoverId = createTurnoverRes.body.id;

  return { apartmentId, turnoverId };
};

const getApartment = async (apartmentId) => {
  const res = await request(app).get('/api/v1/get-all-apartments');
  expect(res.statusCode).toBe(200);
  return res.body.find(apartment => apartment.id === apartmentId);
};

defineFeature(feature, test => {
  let apartmentId;
  let turnoverId;
  let response;

  test(
    'Given the tenant has returned keys and the apartment is empty, When the PropertyMgr records the apartment as vacated, Then Apartment Vacated is recorded with timestamp and actor and downstream actors are notified.',
    ({ given, when, then }) => {
      given('the tenant has returned keys and the apartment is empty', async () => {
        ({ apartmentId, turnoverId } = await setUpTurnover('12 Main St'));
      });

      when('the PropertyMgr records the apartment as vacated', async () => {
        response = await request(app)
          .post('/api/v1/record-apartment-vacated')
          .send({
            id: turnoverId,
            apartmentId: apartmentId,
            vacatedAt: CURRENT_DATE,
            keysReturned: 'true', // Per GWT, tenant has returned keys
            notes: 'Tenant keys returned, apartment empty and ready for next steps.',
            nextActorEmail: 'inspections@rentco.com', // Example from OpenAPI for Turnover's nextActorEmail
          });
      });

      then('Apartment Vacated is recorded with timestamp and actor and downstream actors are notified.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(turnoverId);
        expect(response.body.apartmentId).toBe(apartmentId);
        expect(response.body.vacatedAt).toBe(CURRENT_DATE);
        expect(response.body.keysReturned).toBe('true');
        expect(response.body.notes).toBe('Tenant keys returned, apartment empty and ready for next steps.');
        expect(response.body.nextActorEmail).toBe('inspections@rentco.com');

        const apartment = await getApartment(apartmentId);
        expect(apartment.status).toBe('Vacant');
      });
    }
  );

  test(
    "Given the tenant has not returned the keys, When the PropertyMgr records the apartment as vacated, Then the request is refused and the apartment's status does not change.",
    ({ given, when, then }) => {
      given('the tenant has not returned the keys', async () => {
        ({ apartmentId, turnoverId } = await setUpTurnover('14 Main St'));
      });

      when('the PropertyMgr records the apartment as vacated with the keys not returned', async () => {
        response = await request(app)
          .post('/api/v1/record-apartment-vacated')
          .send({
            id: turnoverId,
            apartmentId: apartmentId,
            vacatedAt: CURRENT_DATE,
            keysReturned: 'false',
            notes: 'Tenant still holds the keys.',
            nextActorEmail: 'inspections@rentco.com',
          });
      });

      then("the request is refused and the apartment's status does not change.", async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBeDefined();

        const apartment = await getApartment(apartmentId);
        expect(apartment.status).toBe('Occupied');
      });
    }
  );
});
