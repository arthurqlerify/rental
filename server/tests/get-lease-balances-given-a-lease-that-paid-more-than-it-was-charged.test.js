import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'get-lease-balances-given-a-lease-that-paid-more-than-it-was-charged.feature'));

// On 2025-10-03 the September charge (overdue from 2025-09-06) is overdue and the
// October charge (overdue from 2025-10-06) is not yet.
const AS_OF = '2025-10-03';

const chargeRent = async (leaseId, month) => {
  const response = await request(app).post('/api/v1/charge-rent').send({ leaseId, month });
  expect(response.statusCode).toBe(200);
};

const recordPayment = async (leaseId, amount) => {
  const response = await request(app)
    .post('/api/v1/record-rent-payment')
    .send({ leaseId, amount, paidOn: '2025-09-01', method: 'Bank transfer' });
  expect(response.statusCode).toBe(200);
};

defineFeature(feature, test => {
  test(
    "Given a lease that has paid more than it was charged, When the PropertyMgr views the lease's balance, Then it shows nothing owed and the extra as credit.",
    ({ given, when, then }) => {
      let lease;
      let balancesResponse;

      given('a lease that has paid more than it was charged', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Marcus Lee', currentRent: '1000' });
        await chargeRent(lease.id, '2025-09');
        await recordPayment(lease.id, '1100');
      });

      when("the PropertyMgr views the lease's balance", async () => {
        balancesResponse = await request(app)
          .get('/api/v1/get-all-lease-balances')
          .query({ leaseId: lease.id, asOf: AS_OF });
      });

      then('it shows nothing owed and the extra as credit.', () => {
        expect(balancesResponse.statusCode).toBe(200);
        expect(balancesResponse.body).toHaveLength(1);
        expect(balancesResponse.body[0]).toMatchObject({
          leaseId: lease.id,
          owed: '0.00',
          overdue: '0.00',
          credit: '100.00',
          status: 'In credit'
        });
      });
    }
  );
});
