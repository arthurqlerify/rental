import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-apartment-given-property-exists-and-no-apartment-with-same-unitnumber-exists.feature'));

defineFeature(feature, test => {
  let propertyId;
  let createApartmentPayload;
  let createApartmentResponse;

  test(
    'Given the specified property exists and no apartment with the same unitNumber exists under that property, and floorAreaSqm and bedrooms are positive values, When the PropertyMgr submits Create Apartment with propertyId, unitNumber, floorAreaSqm, bedrooms and a valid initial status (Occupied, Vacant or Ready), Then Apartment Created is recorded with a new apartmentId linked to the property and the apartment is available for leasing and turnover workflows.',
    ({ given, when, then }) => {
      given('the specified property exists and no apartment with the same unitNumber exists under that property, and floorAreaSqm and bedrooms are positive values', async () => {
        const createPropertyRequest = {
          name: 'Pinewood Apartments',
          address: '100 Pine St',
          managerName: 'Alice Smith',
          managerEmail: 'alice.smith@example.com',
          unitsCount: '50',
        };

        const response = await request(app)
          .post('/api/v1/create-property')
          .send(createPropertyRequest)
          .expect(200);

        propertyId = response.body.id;
        expect(propertyId).toBeDefined();
        expect(response.body.name).toBe(createPropertyRequest.name);
      });

      when('the PropertyMgr submits Create Apartment with propertyId, unitNumber, floorAreaSqm, bedrooms and a valid initial status (Occupied, Vacant or Ready)', async () => {
        createApartmentPayload = {
          propertyId: propertyId,
          unitNumber: '101',
          floorAreaSqm: '75',
          bedrooms: '2',
          status: 'Vacant', // A valid initial status
        };

        createApartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send(createApartmentPayload);
      });

      then('Apartment Created is recorded with a new apartmentId linked to the property and the apartment is available for leasing and turnover workflows.', async () => {
        expect(createApartmentResponse.statusCode).toBe(200);
        expect(createApartmentResponse.body).toBeDefined();
        expect(createApartmentResponse.body.id).toBeDefined();
        expect(createApartmentResponse.body.propertyId).toBe(createApartmentPayload.propertyId);
        expect(createApartmentResponse.body.unitNumber).toBe(createApartmentPayload.unitNumber);
        expect(createApartmentResponse.body.floorAreaSqm).toBe(createApartmentPayload.floorAreaSqm);
        expect(createApartmentResponse.body.bedrooms).toBe(createApartmentPayload.bedrooms);
        expect(createApartmentResponse.body.status).toBe(createApartmentPayload.status);
      });
    }
  );
});