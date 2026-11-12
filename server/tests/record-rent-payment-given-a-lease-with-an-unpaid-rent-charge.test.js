import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'record-rent-payment-given-a-lease-with-an-unpaid-rent-charge.feature'));

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
    'Given a lease with an unpaid rent charge, When the PropertyMgr records a part payment by bank transfer, Then Rent Payment Recorded is stored with the amount, date paid and method, and the rest of the charge is still owed.',
    ({ given, when, then }) => {
      let lease;
      let charge;
      let paymentResponse;

      given('a lease with an unpaid rent charge', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Alexandra Nguyen', currentRent: '1000' });
        charge = await chargeRent(lease.id, '2025-09');
      });

      when('the PropertyMgr records a part payment by bank transfer', async () => {
        paymentResponse = await request(app)
          .post('/api/v1/record-rent-payment')
          .send({ leaseId: lease.id, amount: '400', paidOn: '2025-09-03', method: 'Bank transfer' });
      });

      then('Rent Payment Recorded is stored with the amount, date paid and method, and the rest of the charge is still owed.', async () => {
        expect(paymentResponse.statusCode).toBe(200);
        expect(paymentResponse.body).toMatchObject({
          leaseId: lease.id,
          propertyId: lease.propertyId,
          tenantName: 'Alexandra Nguyen',
          amount: '400.00',
          paidOn: '2025-09-03',
          method: 'Bank transfer'
        });

        const paymentsResponse = await request(app).get('/api/v1/get-all-rent-payments').query({ leaseId: lease.id });
        expect(paymentsResponse.statusCode).toBe(200);
        expect(paymentsResponse.body).toHaveLength(1);
        expect(paymentsResponse.body[0].id).toBe(paymentResponse.body.id);

        const [chargeAfter] = await chargesFor(lease.id);
        expect(chargeAfter).toMatchObject({
          id: charge.id,
          amountPaid: '400.00',
          outstanding: '600.00',
          status: 'Partly paid'
        });
        expect((await balanceFor(lease.id)).owed).toBe('600.00');
      });
    }
  );
});
