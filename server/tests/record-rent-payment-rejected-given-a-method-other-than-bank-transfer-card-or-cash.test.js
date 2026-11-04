import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'record-rent-payment-rejected-given-a-method-other-than-bank-transfer-card-or-cash.feature'));

const chargeRent = async (leaseId, month) => {
  const response = await request(app).post('/api/v1/charge-rent').send({ leaseId, month });
  expect(response.statusCode).toBe(200);
  return response.body;
};

const chargesFor = async (leaseId) => {
  const response = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId });
  expect(response.statusCode).toBe(200);
  return response.body;
};

const balanceFor = async (leaseId) => {
  const response = await request(app).get('/api/v1/get-all-lease-balances').query({ leaseId });
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveLength(1);
  return response.body[0];
};

defineFeature(feature, test => {
  test(
    'Given a lease with an unpaid rent charge, When the PropertyMgr records a payment by a method other than bank transfer, card or cash, Then the request is refused and no payment is recorded.',
    ({ given, when, then }) => {
      let lease;
      let paymentResponse;

      given('a lease with an unpaid rent charge', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Tom Berg', currentRent: '1000' });
        await chargeRent(lease.id, '2025-09');
      });

      when('the PropertyMgr records a payment by a method other than bank transfer, card or cash', async () => {
        paymentResponse = await request(app)
          .post('/api/v1/record-rent-payment')
          .send({ leaseId: lease.id, amount: '1000', paidOn: '2025-09-01', method: 'Cheque' });
      });

      then('the request is refused and no payment is recorded.', async () => {
        expect(paymentResponse.statusCode).toBe(400);
        expect(paymentResponse.body.message).toBe('Method must be one of: Bank transfer, Card, Cash.');

        const paymentsResponse = await request(app).get('/api/v1/get-all-rent-payments').query({ leaseId: lease.id });
        expect(paymentsResponse.statusCode).toBe(200);
        expect(paymentsResponse.body).toHaveLength(0);
        expect((await balanceFor(lease.id)).owed).toBe('1000.00');
      });
    }
  );
});
