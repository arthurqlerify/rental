import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'waive-rent-charge-given-a-partly-paid-rent-charge.feature'));

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
    'Given a rent charge that is partly paid, When the PropertyMgr waives the charge with a reason, Then nothing is owed for the charge and what was paid towards it is kept as credit.',
    ({ given, when, then }) => {
      let lease;
      let charge;
      let waiveResponse;

      given('a rent charge that is partly paid', async () => {
        ({ lease, charge } = await createChargedLease('Priya Shah'));
        const paymentResponse = await request(app)
          .post('/api/v1/record-rent-payment')
          .send({ leaseId: lease.id, amount: '300', paidOn: '2025-09-02', method: 'Card' });
        expect(paymentResponse.statusCode).toBe(200);
      });

      when('the PropertyMgr waives the charge with a reason', async () => {
        waiveResponse = await request(app)
          .post('/api/v1/waive-rent-charge')
          .send({ id: charge.id, reason: REASON });
      });

      then('nothing is owed for the charge and what was paid towards it is kept as credit.', async () => {
        expect(waiveResponse.statusCode).toBe(200);

        const { charges, balance } = await viewLease(lease.id);
        expect(charges[0]).toMatchObject({ id: charge.id, status: 'Waived', outstanding: '0.00' });
        expect(balance).toMatchObject({ owed: '0.00', overdue: '0.00', credit: '300.00', status: 'In credit' });
      });
    }
  );
});
