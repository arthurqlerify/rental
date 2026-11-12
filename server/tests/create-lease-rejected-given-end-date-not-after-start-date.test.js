import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-lease-rejected-given-end-date-not-after-start-date.feature'));

defineFeature(feature, test => {
  let apartmentId;
  let leasePayloads;
  let createLeaseResponses;

  test(
    'Given a specific apartment is available for leasing and the PropertyMgr provides a lease end date that does not come after the start date, When the PropertyMgr submits Create Lease, Then no lease is created and the apartment stays available.',
    ({ given, when, then }) => {
      given('a specific apartment is available for leasing and the PropertyMgr provides a lease end date that does not come after the start date', async () => {
        const createPropertyResponse = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: 'Test Property for Lease Dates',
            address: '456 Date St',
            managerName: 'Jane Doe',
            managerEmail: 'jane.doe@example.com',
            unitsCount: '10'
          });
        expect(createPropertyResponse.statusCode).toBe(200);

        const createApartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: createPropertyResponse.body.id,
            unitNumber: '202',
            floorAreaSqm: '60',
            bedrooms: '1',
            status: 'Vacant'
          });
        expect(createApartmentResponse.statusCode).toBe(200);
        apartmentId = createApartmentResponse.body.id;

        const leaseDetails = {
          apartmentId: apartmentId,
          currentRent: '1500',
          nextActorEmail: 'pm@rentco.com',
          tenantName: 'John Tenant'
        };

        // An end date before the start date, and an end date on the start date itself
        leasePayloads = [
          { ...leaseDetails, startDate: '2025-10-01', endDate: '2025-09-30' },
          { ...leaseDetails, startDate: '2025-10-01', endDate: '2025-10-01' }
        ];
      });

      when('the PropertyMgr submits Create Lease', async () => {
        createLeaseResponses = [];
        for (const payload of leasePayloads) {
          createLeaseResponses.push(await request(app).post('/api/v1/create-lease').send(payload));
        }
      });

      then('no lease is created and the apartment stays available.', async () => {
        for (const response of createLeaseResponses) {
          expect(response.statusCode).toBe(400);
          expect(response.body.message).toBe('Lease end date must come after the start date.');
        }

        const getAllLeasesResponse = await request(app).get('/api/v1/get-all-leases');
        expect(getAllLeasesResponse.statusCode).toBe(200);
        expect(getAllLeasesResponse.body.filter(lease => lease.apartmentId === apartmentId)).toHaveLength(0);

        const getApartmentsResponse = await request(app).get('/api/v1/get-all-apartments');
        expect(getApartmentsResponse.statusCode).toBe(200);
        const apartment = getApartmentsResponse.body.find(apt => apt.id === apartmentId);
        expect(apartment).toBeDefined();
        expect(apartment.status).toBe('Vacant');
      });
    }
  );
});
