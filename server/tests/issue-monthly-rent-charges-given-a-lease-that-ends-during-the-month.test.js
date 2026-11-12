import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'issue-monthly-rent-charges-given-a-lease-that-ends-during-the-month.feature'));

const chargesFor = async (leaseId) => {
  const response = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId });
  expect(response.statusCode).toBe(200);
  return response.body;
};

defineFeature(feature, test => {
  test(
    "Given a lease that ends during the month, When the PropertyMgr issues the month's rent charges, Then the lease is charged only for the days up to its end date, due on the 1st.",
    ({ given, when, then }) => {
      const MONTH = '2025-12';
      let lease;
      let issueResponse;

      given('a lease that ends during the month', async () => {
        const propertyId = await createProperty();
        // December has 31 days; up to the 10th the lease runs for 10 of them.
        lease = await createLease({ propertyId, tenantName: 'Leaving Tenant', currentRent: '3100', endDate: '2025-12-10' });
      });

      when("the PropertyMgr issues the month's rent charges", async () => {
        issueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
      });

      then('the lease is charged only for the days up to its end date, due on the 1st.', async () => {
        expect(issueResponse.statusCode).toBe(200);

        const charges = await chargesFor(lease.id);
        expect(charges).toHaveLength(1);
        expect(charges[0]).toMatchObject({
          month: MONTH,
          dueDate: '2025-12-01',
          amount: '1000.00',
          daysCharged: 10,
          daysInMonth: 31
        });
      });
    }
  );
});
