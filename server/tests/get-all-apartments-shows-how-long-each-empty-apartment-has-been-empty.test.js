import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import db from '../src/infrastructure/db/index.js';
import { onDay } from './support/clock.js';
import { createActiveTurnover } from './support/inspectionFixtures.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'get-all-apartments-shows-how-long-each-empty-apartment-has-been-empty.feature'));

// The Apartments list is viewed on this day. The tenant left ten days before it, and the empty
// apartment was created three days before it.
const TODAY = '2025-09-15';
const VACATED_AT = '2025-09-05T10:00';
const CREATED_ON = '2025-09-12';

// An apartment whose tenant has been recorded as leaving at VACATED_AT.
const createVacatedApartment = async () => {
  const { turnoverId, apartmentId } = await createActiveTurnover();
  const response = await request(app)
    .post('/api/v1/record-apartment-vacated')
    .send({
      id: turnoverId,
      apartmentId,
      vacatedAt: VACATED_AT,
      keysReturned: 'true',
      notes: 'Keys returned.',
      nextActorEmail: 'inspections@rentco.com'
    });
  expect(response.statusCode).toBe(200);
  return apartmentId;
};

const viewApartments = () => onDay(TODAY, () => request(app).get('/api/v1/get-all-apartments'));

const findApartment = (response, apartmentId) => response.body.find((apartment) => apartment.id === apartmentId);

defineFeature(feature, test => {
  test(
    'Given an apartment vacated ten days ago, an apartment created empty three days ago and an apartment with a tenant, When the PropertyMgr views the Apartments list, Then each empty apartment shows how many days it has been empty and the apartment with a tenant shows nothing.',
    ({ given, when, then }) => {
      let vacatedApartmentId;
      let createdEmptyApartmentId;
      let occupiedApartmentId;
      let response;

      given('an apartment vacated ten days ago, an apartment created empty three days ago and an apartment with a tenant', async () => {
        vacatedApartmentId = await createVacatedApartment();

        const propertyId = await createProperty();
        const createdResponse = await onDay(CREATED_ON, () =>
          request(app)
            .post('/api/v1/create-apartment')
            .send({ propertyId, unitNumber: 'E-1', floorAreaSqm: '55', bedrooms: '1', status: 'Ready' })
        );
        expect(createdResponse.statusCode).toBe(200);
        createdEmptyApartmentId = createdResponse.body.id;

        const lease = await createLease({ propertyId, tenantName: 'Robin Park', currentRent: '1200' });
        occupiedApartmentId = lease.apartmentId;
      });

      when('the PropertyMgr views the Apartments list', async () => {
        response = await viewApartments();
      });

      then('each empty apartment shows how many days it has been empty and the apartment with a tenant shows nothing.', () => {
        expect(response.statusCode).toBe(200);

        const vacated = findApartment(response, vacatedApartmentId);
        expect(vacated.status).toBe('Vacant');
        expect(vacated.emptySince).toBe(VACATED_AT);
        expect(vacated.daysEmpty).toBe(10);

        const createdEmpty = findApartment(response, createdEmptyApartmentId);
        expect(createdEmpty.status).toBe('Ready');
        expect(createdEmpty.emptySince).toBe(`${CREATED_ON}T12:00:00.000Z`);
        expect(createdEmpty.daysEmpty).toBe(3);

        const occupied = findApartment(response, occupiedApartmentId);
        expect(occupied.status).toBe('Occupied');
        expect(occupied.emptySince).toBeNull();
        expect(occupied.daysEmpty).toBeNull();
      });
    }
  );

  test(
    'Given an empty apartment saved before its empty-since date was kept, When the PropertyMgr views the Apartments list, Then it shows the days since its tenant was recorded as leaving.',
    ({ given, when, then }) => {
      let apartmentId;
      let response;

      given('an empty apartment saved before its empty-since date was kept', async () => {
        apartmentId = await createVacatedApartment();
        // An apartment saved by an older version of the app has no emptySince.
        await db.update('Apartment', apartmentId, { emptySince: undefined });
      });

      when('the PropertyMgr views the Apartments list', async () => {
        response = await viewApartments();
      });

      then('it shows the days since its tenant was recorded as leaving.', () => {
        expect(response.statusCode).toBe(200);
        const apartment = findApartment(response, apartmentId);
        expect(apartment.status).toBe('Vacant');
        expect(apartment.emptySince).toBeUndefined();
        expect(apartment.daysEmpty).toBe(10);
      });
    }
  );
});
