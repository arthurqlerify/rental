import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'issue-monthly-rent-charges-rejected-given-the-month-already-issued.feature'));

const chargesFor = async (leaseId) => {
  const response = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId });
  expect(response.statusCode).toBe(200);
  return response.body;
};

defineFeature(feature, test => {
  test(
    "Given the month's rent charges have already been issued, When the PropertyMgr issues the month's rent charges again, Then the request is refused and no lease is charged twice for the month.",
    ({ given, when, then }) => {
      const MONTH = '2026-01';
      let lease;
      let secondIssueResponse;

      given("the month's rent charges have already been issued", async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Steady Tenant', currentRent: '1300' });

        const firstIssueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
        expect(firstIssueResponse.statusCode).toBe(200);
        expect(firstIssueResponse.body.charged.map(charge => charge.leaseId)).toContain(lease.id);
      });

      when("the PropertyMgr issues the month's rent charges again", async () => {
        secondIssueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
      });

      then('the request is refused and no lease is charged twice for the month.', async () => {
        expect(secondIssueResponse.statusCode).toBe(400);
        expect(secondIssueResponse.body.message).toBe(`Rent for ${MONTH} has already been charged for every active lease.`);

        const allChargesResponse = await request(app).get('/api/v1/get-all-rent-charges');
        expect(allChargesResponse.statusCode).toBe(200);
        const monthCharges = allChargesResponse.body.filter(charge => charge.month === MONTH);
        const leaseIds = monthCharges.map(charge => charge.leaseId);
        expect(leaseIds).toContain(lease.id);
        expect(new Set(leaseIds).size).toBe(leaseIds.length);
      });
    }
  );
});
