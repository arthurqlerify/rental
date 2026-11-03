import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'record-rent-payment-given-a-lease-with-rent-charges.feature'));

let propertyId;
let unitCount = 0;

// Creates an apartment and a lease on it, under one property for the whole feature.
const createLease = async ({ tenantName, currentRent }) => {
  if (!propertyId) {
    const propertyRes = await request(app)
      .post('/api/v1/create-property')
      .send({ name: 'Maple Court', address: '31 Rent St', managerName: 'Jordan Alvarez', managerEmail: 'pm@rentco.com', unitsCount: '20' });
    expect(propertyRes.statusCode).toBe(200);
    propertyId = propertyRes.body.id;
  }
  unitCount += 1;

  const apartmentRes = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `${unitCount}B`, floorAreaSqm: '62', bedrooms: '2', status: 'Vacant' });
  expect(apartmentRes.statusCode).toBe(200);

  const leaseRes = await request(app)
    .post('/api/v1/create-lease')
    .send({ apartmentId: apartmentRes.body.id, currentRent, nextActorEmail: 'ops@rentco.com', tenantName });
  expect(leaseRes.statusCode).toBe(200);
  return leaseRes.body.id;
};

const issueCharges = async (month) => {
  const res = await request(app).post('/api/v1/issue-rent-charges').send({ month });
  expect(res.statusCode).toBe(200);
};

const recordPayment = (payment) => request(app).post('/api/v1/record-rent-payment').send(payment);

const chargeOf = async (leaseId, month) => {
  const res = await request(app).get(`/api/v1/get-all-rent-charges?leaseId=${leaseId}&asOf=${month}-02`);
  expect(res.statusCode).toBe(200);
  return res.body.find((c) => c.month === month);
};

const balanceOf = async (leaseId) => {
  const res = await request(app).get(`/api/v1/get-all-lease-balances?leaseId=${leaseId}`);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(1);
  return res.body[0];
};

const paymentsOf = async (leaseId) => {
  const res = await request(app).get(`/api/v1/get-all-rent-payments?leaseId=${leaseId}`);
  expect(res.statusCode).toBe(200);
  return res.body;
};

defineFeature(feature, test => {
  let leaseId;
  let response;

  test(
    'Given a lease with unpaid rent charges for two months, When the PropertyMgr records a payment that covers less than what is owed, Then the payment pays the oldest unpaid charge first and the rest is still owed.',
    ({ given, when, then }) => {
      given('a lease with unpaid rent charges for two months', async () => {
        leaseId = await createLease({ tenantName: 'Alex Morgan', currentRent: '1000' });
        // Charged out of order, so the oldest is not the first one issued
        await issueCharges('2026-02');
        await issueCharges('2026-01');
      });

      when('the PropertyMgr records a payment that covers less than what is owed', async () => {
        response = await recordPayment({ leaseId, amount: '1300', paidOn: '2026-02-03', method: 'BankTransfer' });
      });

      then('the payment pays the oldest unpaid charge first and the rest is still owed.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
          leaseId,
          propertyId,
          tenantName: 'Alex Morgan',
          amount: 1300,
          paidOn: '2026-02-03',
          method: 'BankTransfer',
          creditAmount: 0,
        });
        expect(response.body.allocations.map(({ month, amount }) => ({ month, amount }))).toEqual([
          { month: '2026-01', amount: 1000 },
          { month: '2026-02', amount: 300 },
        ]);

        expect(await chargeOf(leaseId, '2026-01')).toMatchObject({ amountPaid: 1000, owed: 0, status: 'Paid' });
        expect(await chargeOf(leaseId, '2026-02')).toMatchObject({ amountPaid: 300, owed: 700, status: 'Part paid' });
        expect(await balanceOf(leaseId)).toMatchObject({ owed: 700, credit: 0 });

        const payments = await paymentsOf(leaseId);
        expect(payments).toHaveLength(1);
        expect(payments[0].id).toBe(response.body.id);
      });
    }
  );

  test(
    'Given a lease with an unpaid rent charge, When the PropertyMgr records a payment beyond what is owed, Then the extra is kept as credit and pays the next charge when it is issued.',
    ({ given, when, then }) => {
      given('a lease with an unpaid rent charge', async () => {
        leaseId = await createLease({ tenantName: 'Sam Lee', currentRent: '800' });
        await issueCharges('2026-03');
      });

      when('the PropertyMgr records a payment beyond what is owed', async () => {
        response = await recordPayment({ leaseId, amount: 1050, paidOn: '2026-03-01', method: 'Card' });
      });

      then('the extra is kept as credit and pays the next charge when it is issued.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.allocations.map(({ month, amount }) => ({ month, amount }))).toEqual([
          { month: '2026-03', amount: 800 },
        ]);
        expect(response.body.creditAmount).toBe(250);
        expect(await balanceOf(leaseId)).toMatchObject({ owed: 0, credit: 250 });

        await issueCharges('2026-04');
        expect(await chargeOf(leaseId, '2026-04')).toMatchObject({
          amount: 800,
          creditApplied: 250,
          amountPaid: 250,
          owed: 550,
          status: 'Part paid',
        });
        expect(await balanceOf(leaseId)).toMatchObject({ owed: 550, credit: 0 });
      });
    }
  );

  test(
    'Given a lease, When the PropertyMgr records a payment with a method other than bank transfer, card or cash or with an amount that is not positive, Then the payment is refused and nothing is recorded.',
    ({ given, when, then }) => {
      let responses;

      given('a lease', async () => {
        leaseId = await createLease({ tenantName: 'Robin Park', currentRent: '900' });
      });

      when('the PropertyMgr records a payment with a method other than bank transfer, card or cash or with an amount that is not positive', async () => {
        responses = [
          await recordPayment({ leaseId, amount: '900', paidOn: '2026-05-01', method: 'Cheque' }),
          await recordPayment({ leaseId, amount: '0', paidOn: '2026-05-01', method: 'Cash' }),
          await recordPayment({ leaseId, amount: '-50', paidOn: '2026-05-01', method: 'Cash' }),
          await recordPayment({ leaseId, amount: 'ten', paidOn: '2026-05-01', method: 'Cash' }),
          await recordPayment({ leaseId, amount: '10.005', paidOn: '2026-05-01', method: 'Cash' }),
          await recordPayment({ leaseId, amount: '1e400', paidOn: '2026-05-01', method: 'Cash' }),
          await recordPayment({ leaseId, amount: '900', paidOn: 'yesterday', method: 'Cash' }),
          await recordPayment({ leaseId: 'no-such-lease', amount: '900', paidOn: '2026-05-01', method: 'Cash' }),
        ];
      });

      then('the payment is refused and nothing is recorded.', async () => {
        for (const res of responses) {
          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBeDefined();
        }
        expect(await paymentsOf(leaseId)).toEqual([]);
        expect(await balanceOf(leaseId)).toMatchObject({ owed: 0, credit: 0 });
      });
    }
  );
});
