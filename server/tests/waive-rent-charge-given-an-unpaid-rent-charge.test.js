import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'waive-rent-charge-given-an-unpaid-rent-charge.feature'));

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
    'Given an unpaid rent charge, When the PropertyMgr waives the charge with a reason, Then Rent Charge Waived is recorded with the reason and nothing is owed for the charge.',
    ({ given, when, then }) => {
      let lease;
      let charge;
      let waiveResponse;

      given('an unpaid rent charge', async () => {
        ({ lease, charge } = await createChargedLease('Alexandra Nguyen'));
      });

      when('the PropertyMgr waives the charge with a reason', async () => {
        waiveResponse = await request(app)
          .post('/api/v1/waive-rent-charge')
          .send({ id: charge.id, reason: REASON });
      });

      then('Rent Charge Waived is recorded with the reason and nothing is owed for the charge.', async () => {
        expect(waiveResponse.statusCode).toBe(200);
        expect(waiveResponse.body).toMatchObject({ id: charge.id, leaseId: lease.id, waiverReason: REASON });
        expect(typeof waiveResponse.body.waivedAt).toBe('string');

        const { charges, balance } = await viewLease(lease.id);
        expect(charges[0]).toMatchObject({
          id: charge.id,
          status: 'Waived',
          outstanding: '0.00',
          overdue: false,
          waiverReason: REASON
        });
        expect(balance).toMatchObject({ owed: '0.00', overdue: '0.00', credit: '0.00', status: 'Paid up' });
      });
    }
  );
});
