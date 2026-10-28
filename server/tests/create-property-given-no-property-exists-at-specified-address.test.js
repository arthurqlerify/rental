import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-property-given-no-property-exists-at-specified-address.feature'));

defineFeature(feature, test => {
  let createPropertyPayload;
  let createPropertyResponse;
  let propertyId;

  const PROPERTY_NAME = "Test Property Alpha";
  const PROPERTY_ADDRESS = "101 Test Street";
  const MANAGER_NAME = "John Doe";
  const MANAGER_EMAIL = "john.doe@example.com";
  const UNITS_COUNT = "50";

  test(
    'Given no property exists at the specified address and the PropertyMgr provides name, address, managerName, managerEmail and a positive unitsCount, When the PropertyMgr submits Create Property, Then Property Created is recorded with a new propertyId and the provided details, and the property becomes available to create apartments under it.',
    ({ given, when, then }) => {
      given('no property exists at the specified address and the PropertyMgr provides name, address, managerName, managerEmail and a positive unitsCount', async () => {
        createPropertyPayload = {
          name: PROPERTY_NAME,
          address: PROPERTY_ADDRESS,
          managerName: MANAGER_NAME,
          managerEmail: MANAGER_EMAIL,
          unitsCount: UNITS_COUNT,
        };

        const getAllPropertiesResponse = await request(app).get('/api/v1/get-all-propertys');
        expect(getAllPropertiesResponse.statusCode).toBe(200);
        expect(getAllPropertiesResponse.body.some(p => p.address === PROPERTY_ADDRESS)).toBe(false);
      });

      when('the PropertyMgr submits Create Property', async () => {
        createPropertyResponse = await request(app)
          .post('/api/v1/create-property')
          .send(createPropertyPayload);
      });

      then('Property Created is recorded with a new propertyId and the provided details, and the property becomes available to create apartments under it.', async () => {
        expect(createPropertyResponse.statusCode).toBe(200);
        expect(typeof createPropertyResponse.body.id).toBe('string');
        propertyId = createPropertyResponse.body.id;

        expect(createPropertyResponse.body).toMatchObject(createPropertyPayload);

        const getAllPropertiesResponse = await request(app).get('/api/v1/get-all-propertys');
        expect(getAllPropertiesResponse.statusCode).toBe(200);
        expect(getAllPropertiesResponse.body.find(p => p.id === propertyId)).toMatchObject(createPropertyPayload);

        // The property is available to create apartments under it
        const createApartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId,
            unitNumber: '1A',
            floorAreaSqm: '60',
            bedrooms: '2',
            status: 'Vacant',
          });
        expect(createApartmentResponse.statusCode).toBe(200);
        expect(createApartmentResponse.body.propertyId).toBe(propertyId);
      });
    }
  );
});
