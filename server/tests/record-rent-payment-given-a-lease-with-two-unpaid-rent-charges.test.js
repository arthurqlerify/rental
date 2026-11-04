import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'record-rent-payment-given-a-lease-with-two-unpaid-rent-charges.feature'));

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
    'Given a lease with two unpaid rent charges, When the PropertyMgr records a payment that covers more than the oldest charge, Then the oldest charge is paid in full and the rest of the payment goes to the next charge.',
    ({ given, when, then }) => {
      let lease;
      let septemberCharge;
      let octoberCharge;
      let paymentResponse;

      given('a lease with two unpaid rent charges', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Marcus Lee', currentRent: '1000' });
        // Charged newest first, so the order they were issued in does not decide which is paid.
        octoberCharge = await chargeRent(lease.id, '2025-10');
        septemberCharge = await chargeRent(lease.id, '2025-09');
      });

      when('the PropertyMgr records a payment that covers more than the oldest charge', async () => {
        paymentResponse = await request(app)
          .post('/api/v1/record-rent-payment')
          .send({ leaseId: lease.id, amount: '1500', paidOn: '2025-10-02', method: 'Card' });
      });

      then('the oldest charge is paid in full and the rest of the payment goes to the next charge.', async () => {
        expect(paymentResponse.statusCode).toBe(200);

        const charges = await chargesFor(lease.id);
        expect(charges.find(c => c.id === septemberCharge.id)).toMatchObject({
          amountPaid: '1000.00',
          outstanding: '0.00',
          status: 'Paid'
        });
        expect(charges.find(c => c.id === octoberCharge.id)).toMatchObject({
          amountPaid: '500.00',
          outstanding: '500.00',
          status: 'Partly paid'
        });
        expect((await balanceFor(lease.id)).owed).toBe('500.00');
      });
    }
  );
});
