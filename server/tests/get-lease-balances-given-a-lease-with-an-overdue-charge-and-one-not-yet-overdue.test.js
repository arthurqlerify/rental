import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'get-lease-balances-given-a-lease-with-an-overdue-charge-and-one-not-yet-overdue.feature'));

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
    "Given a lease with an overdue charge and a charge that is not yet overdue, When the PropertyMgr views the lease's balance, Then it shows everything owed and how much of it is overdue.",
    ({ given, when, then }) => {
      let lease;
      let balancesResponse;

      given('a lease with an overdue charge and a charge that is not yet overdue', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Alexandra Nguyen', currentRent: '1000' });
        await chargeRent(lease.id, '2025-09');
        await chargeRent(lease.id, '2025-10');
      });

      when("the PropertyMgr views the lease's balance", async () => {
        balancesResponse = await request(app)
          .get('/api/v1/get-all-lease-balances')
          .query({ leaseId: lease.id, asOf: AS_OF });
      });

      then('it shows everything owed and how much of it is overdue.', () => {
        expect(balancesResponse.statusCode).toBe(200);
        expect(balancesResponse.body).toEqual([
          {
            leaseId: lease.id,
            tenantName: 'Alexandra Nguyen',
            propertyId: lease.propertyId,
            apartmentId: lease.apartmentId,
            owed: '2000.00',
            overdue: '1000.00',
            credit: '0.00',
            status: 'Overdue'
          }
        ]);
      });
    }
  );
});
