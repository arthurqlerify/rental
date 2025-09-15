import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'provide-renovation-estimate-given-an-estimate-request-exists-with-defined-scope-and-apartment-details.feature'));

defineFeature(feature, test => {
  let renovationCaseId;
  let provideRenovationEstimateResponse;

  test(
    'Given an estimate request exists with defined scope and apartment details, When the ConstrDept submits costs, lead times and assumptions for each renovation level, Then Renovation Estimate Provided is recorded with the option set.',
    ({ given, when, then }) => {
      given('an estimate request exists with defined scope and apartment details', async () => {
        const createRequestPayload = {
          turnoverId: 'to-5001-d457',
          apartmentId: 'apt-22B-d457',
          requestedLevels: 'good,better,premium',
          scopeNotes: 'Initial painting and fixture upgrades.',
          targetReadyDate: '2025-11-30',
          nextActorEmail: 'constr@rentco.com'
        };

        const response = await request(app)
          .post('/api/v1/request-renovation-estimate')
          .send(createRequestPayload);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBeDefined();
        renovationCaseId = response.body.id;
      });

      when('the ConstrDept submits costs, lead times and assumptions for each renovation level', async () => {
        const provideEstimatePayload = {
          id: renovationCaseId,
          costGood: '1500',
          costBetter: '2500',
          costPremium: '4000',
          leadDaysGood: '7',
          leadDaysBetter: '12',
          leadDaysPremium: '20',
          nextActorEmail: 'pm@rentco.com'
        };

        provideRenovationEstimateResponse = await request(app)
          .post('/api/v1/provide-renovation-estimate')
          .send(provideEstimatePayload);
      });

      then('Renovation Estimate Provided is recorded with the option set', async () => {
        expect(provideRenovationEstimateResponse.statusCode).toBe(200);
        expect(provideRenovationEstimateResponse.body).toBeDefined();
        expect(provideRenovationEstimateResponse.body.id).toBe(renovationCaseId);
        expect(provideRenovationEstimateResponse.body.costGood).toBe('1500');
        expect(provideRenovationEstimateResponse.body.costBetter).toBe('2500');
        expect(provideRenovationEstimateResponse.body.costPremium).toBe('4000');
        expect(provideRenovationEstimateResponse.body.leadDaysGood).toBe('7');
        expect(provideRenovationEstimateResponse.body.leadDaysBetter).toBe('12');
        expect(provideRenovationEstimateResponse.body.leadDaysPremium).toBe('20');
        expect(provideRenovationEstimateResponse.body.nextActorEmail).toBe('pm@rentco.com');
      });
    }
  );
});