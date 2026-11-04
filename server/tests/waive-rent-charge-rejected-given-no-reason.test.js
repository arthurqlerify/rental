import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'waive-rent-charge-rejected-given-no-reason.feature'));

const REASON = 'Burst pipe left the flat unusable for the month';

const createChargedLease = async (tenantName) => {
  const propertyId = await createProperty();
  const lease = await createLease({ propertyId, tenantName, currentRent: '1000' });
  const chargeResponse = await request(app).post('/api/v1/charge-rent').send({ leaseId: lease.id, month: '2025-09' });
  expect(chargeResponse.statusCode).toBe(200);
  return { lease, charge: chargeResponse.body };
};

const viewLease = async (leaseId) => {
  const chargesResponse = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId, asOf: '2025-10-15' });
  expect(chargesResponse.statusCode).toBe(200);
  const balancesResponse = await request(app).get('/api/v1/get-all-lease-balances').query({ leaseId, asOf: '2025-10-15' });
  expect(balancesResponse.statusCode).toBe(200);
  return { charges: chargesResponse.body, balance: balancesResponse.body[0] };
};

defineFeature(feature, test => {
  test(
    'Given an unpaid rent charge, When the PropertyMgr waives the charge without a reason, Then the request is refused and the charge is still owed.',
    ({ given, when, then }) => {
      let lease;
      let charge;
      let waiveResponse;

      given('an unpaid rent charge', async () => {
        ({ lease, charge } = await createChargedLease('Marcus Lee'));
      });

      when('the PropertyMgr waives the charge without a reason', async () => {
        waiveResponse = await request(app)
          .post('/api/v1/waive-rent-charge')
          .send({ id: charge.id, reason: '  ' });
      });

      then('the request is refused and the charge is still owed.', async () => {
        expect(waiveResponse.statusCode).toBe(400);
        expect(waiveResponse.body.message).toBe('A reason is required to waive a rent charge.');

        const { charges, balance } = await viewLease(lease.id);
        expect(charges[0]).toMatchObject({ id: charge.id, status: 'Unpaid', outstanding: '1000.00' });
        expect(charges[0].waivedAt).toBeFalsy();
        expect(balance.owed).toBe('1000.00');
      });
    }
  );
});
