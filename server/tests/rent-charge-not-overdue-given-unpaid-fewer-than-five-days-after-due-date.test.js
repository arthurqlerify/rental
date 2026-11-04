import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'rent-charge-not-overdue-given-unpaid-fewer-than-five-days-after-due-date.feature'));

// The September charge is due on 2025-09-01, so it is overdue from 2025-09-06.
const MONTH = '2025-09';

const chargeRent = async (leaseId) => {
  const response = await request(app).post('/api/v1/charge-rent').send({ leaseId, month: MONTH });
  expect(response.statusCode).toBe(200);
  expect(response.body.dueDate).toBe('2025-09-01');
  return response.body;
};

const recordPayment = async (leaseId, amount, paidOn) => {
  const response = await request(app)
    .post('/api/v1/record-rent-payment')
    .send({ leaseId, amount, paidOn, method: 'Bank transfer' });
  expect(response.statusCode).toBe(200);
};

const viewOn = async (leaseId, asOf) => {
  const chargesResponse = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId, asOf });
  expect(chargesResponse.statusCode).toBe(200);
  const balancesResponse = await request(app).get('/api/v1/get-all-lease-balances').query({ leaseId, asOf });
  expect(balancesResponse.statusCode).toBe(200);
  return { charge: chargesResponse.body[0], balance: balancesResponse.body[0] };
};

defineFeature(feature, test => {
  test(
    'Given an unpaid rent charge, When fewer than 5 days have passed since its due date, Then the charge is owed but not yet overdue.',
    ({ given, when, then }) => {
      let lease;
      let view;

      given('an unpaid rent charge', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Marcus Lee', currentRent: '1000' });
        await chargeRent(lease.id);
      });

      when('fewer than 5 days have passed since its due date', async () => {
        view = await viewOn(lease.id, '2025-09-05');
      });

      then('the charge is owed but not yet overdue.', () => {
        expect(view.charge).toMatchObject({ outstanding: '1000.00', status: 'Unpaid', overdue: false });
        expect(view.balance).toMatchObject({ owed: '1000.00', overdue: '0.00', status: 'Owing' });
      });
    }
  );
});
