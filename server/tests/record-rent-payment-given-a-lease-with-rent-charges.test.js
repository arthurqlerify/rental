import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'record-rent-payment-given-a-lease-with-rent-charges.feature'));

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
