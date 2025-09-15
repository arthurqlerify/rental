import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'request-renovation-estimate-given-turnover-with-damage-report-or-upgrade.feature'));

defineFeature(feature, test => {
  let createPropertyResponse;
  let createApartmentResponse;
  let createTurnoverResponse;
  let renovationEstimateRequestResponse;
  let turnoverId;
  let apartmentId;
  let propertyId;

  const CURRENT_DATE = '2025-09-15T16:54:12.452Z';

  test(
    'Given a turnover with a damage report or an upgrade need and apartment profile data, When the PropertyMgr requests a renovation estimate including levels none, good, better and premium, Then Renovation Estimate Requested is recorded and the construction department is notified.',
    ({ given, when, then }) => {
      given('a turnover with a damage report or an upgrade need and apartment profile data', async () => {
        // 1. Create a Property
        const propertyPayload = {
          name: 'Test Property for Renovation',
          address: '456 Renovation Lane',
          managerName: 'Property Manager',
          managerEmail: 'pm@test.com',
          unitsCount: '1',
        };
        createPropertyResponse = await request(app).post('/api/v1/create-property').send(propertyPayload);
        expect(createPropertyResponse.statusCode).toBe(200);
        propertyId = createPropertyResponse.body.id;

        // 2. Create an Apartment
        const apartmentPayload = {
          propertyId: propertyId,
          unitNumber: '2B',
          floorAreaSqm: '70',
          bedrooms: '2',
          status: 'Vacant',
        };
        createApartmentResponse = await request(app).post('/api/v1/create-apartment').send(apartmentPayload);
        expect(createApartmentResponse.statusCode).toBe(200);
        apartmentId = createApartmentResponse.body.id;

        // 3. Create a Turnover
        const turnoverPayload = {
          leaseId: 'lease-renovation-estimate-1', // Mock leaseId
          apartmentId: apartmentId,
          targetReadyDate: '2025-11-15',
          propertyId: propertyId,
          nextActorEmail: 'inspections@rentco.com',
        };
        createTurnoverResponse = await request(app).post('/api/v1/create-turnover').send(turnoverPayload);
        expect(createTurnoverResponse.statusCode).toBe(200);
        turnoverId = createTurnoverResponse.body.id;
      });

      when('the PropertyMgr requests a renovation estimate including levels none, good, better and premium', async () => {
        const requestPayload = {
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          requestedLevels: 'none,good,better,premium',
          scopeNotes: 'General refurbishment due to damage and upgrade potential',
          targetReadyDate: '2025-11-15', // Consistent with turnover target ready date
          nextActorEmail: 'constr@rentco.com', // Construction department is notified
        };
        renovationEstimateRequestResponse = await request(app)
          .post('/api/v1/request-renovation-estimate')
          .send(requestPayload);
      });

      then('Renovation Estimate Requested is recorded and the construction department is notified.', async () => {
        expect(renovationEstimateRequestResponse.statusCode).toBe(200);
        expect(renovationEstimateRequestResponse.body).toBeDefined();
        expect(renovationEstimateRequestResponse.body.id).toBeDefined();
        expect(renovationEstimateRequestResponse.body.turnoverId).toEqual(turnoverId);
        expect(renovationEstimateRequestResponse.body.apartmentId).toEqual(apartmentId);
        expect(renovationEstimateRequestResponse.body.requestedLevels).toEqual('none,good,better,premium');
        expect(renovationEstimateRequestResponse.body.nextActorEmail).toEqual('constr@rentco.com');
        expect(renovationEstimateRequestResponse.body.scopeNotes).toEqual('General refurbishment due to damage and upgrade potential');
        expect(renovationEstimateRequestResponse.body.targetReadyDate).toEqual('2025-11-15');
      });
    }
  );
});