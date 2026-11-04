import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'record-rent-payment-of-more-than-is-owed-given-a-lease-with-one-rent-charge.feature'));

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
    'Given a lease with one rent charge, When the tenant pays more than is owed, Then the extra is kept as credit and pays towards the next charge.',
    ({ given, when, then, and }) => {
      let lease;
      let paymentResponse;

      given('a lease with one rent charge', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Priya Shah', currentRent: '1000' });
        await chargeRent(lease.id, '2025-09');
      });

      when('the tenant pays more than is owed', async () => {
        paymentResponse = await request(app)
          .post('/api/v1/record-rent-payment')
          .send({ leaseId: lease.id, amount: '1250', paidOn: '2025-09-01', method: 'Cash' });
      });

      then('the extra is kept as credit', async () => {
        expect(paymentResponse.statusCode).toBe(200);

        const balance = await balanceFor(lease.id);
        expect(balance).toMatchObject({ owed: '0.00', credit: '250.00', status: 'In credit' });
      });

      and('the credit pays towards the next charge.', async () => {
        const octoberCharge = await chargeRent(lease.id, '2025-10');

        const charges = await chargesFor(lease.id);
        expect(charges.find(c => c.id === octoberCharge.id)).toMatchObject({
          amountPaid: '250.00',
          outstanding: '750.00',
          status: 'Partly paid'
        });

        const balance = await balanceFor(lease.id);
        expect(balance).toMatchObject({ owed: '750.00', credit: '0.00' });
      });
    }
  );
});
