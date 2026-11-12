import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'get-lease-balances-given-leases-in-a-property-paid-up-owing-and-overdue.feature'));

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
    'Given leases in a property that are paid up, owing and overdue, When the PropertyMgr views the lease balances for the property, Then every lease has a balance and the overdue lease is listed first and marked overdue.',
    ({ given, when, then }) => {
      let propertyId;
      let paidUpLease;
      let owingLease;
      let overdueLease;
      let balancesResponse;

      given('leases in a property that are paid up, owing and overdue', async () => {
        propertyId = await createProperty();
        paidUpLease = await createLease({ propertyId, tenantName: 'Paid Up Tenant', currentRent: '900' });
        owingLease = await createLease({ propertyId, tenantName: 'Owing Tenant', currentRent: '800' });
        overdueLease = await createLease({ propertyId, tenantName: 'Overdue Tenant', currentRent: '700' });

        await chargeRent(paidUpLease.id, '2025-10');
        await recordPayment(paidUpLease.id, '900');
        await chargeRent(owingLease.id, '2025-10');
        await chargeRent(overdueLease.id, '2025-09');
      });

      when('the PropertyMgr views the lease balances for the property', async () => {
        balancesResponse = await request(app)
          .get('/api/v1/get-all-lease-balances')
          .query({ propertyId, asOf: AS_OF });
      });

      then('every lease has a balance and the overdue lease is listed first and marked overdue.', () => {
        expect(balancesResponse.statusCode).toBe(200);
        expect(balancesResponse.body.map(balance => balance.leaseId)).toEqual([
          overdueLease.id,
          owingLease.id,
          paidUpLease.id
        ]);
        expect(balancesResponse.body[0]).toMatchObject({ owed: '700.00', overdue: '700.00', status: 'Overdue' });
        expect(balancesResponse.body[1]).toMatchObject({ owed: '800.00', overdue: '0.00', status: 'Owing' });
        expect(balancesResponse.body[2]).toMatchObject({ owed: '0.00', overdue: '0.00', status: 'Paid up' });
      });
    }
  );
});
