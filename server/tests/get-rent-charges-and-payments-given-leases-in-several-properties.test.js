import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'get-rent-charges-and-payments-given-leases-in-several-properties.feature'));

const AS_OF = '2025-10-03';

const chargeRent = async (leaseId, month) => {
  const response = await request(app).post('/api/v1/charge-rent').send({ leaseId, month });
  expect(response.statusCode).toBe(200);
  return response.body;
};

const recordPayment = async (leaseId, amount) => {
  const response = await request(app)
    .post('/api/v1/record-rent-payment')
    .send({ leaseId, amount, paidOn: '2025-09-02', method: 'Bank transfer' });
  expect(response.statusCode).toBe(200);
  return response.body;
};

// Property A: a lease that paid September in full and one that has not paid it.
// Property B: a lease that paid part of September and has not paid October yet.
const givenTwoProperties = async () => {
  const propertyAId = await createProperty();
  const propertyBId = await createProperty();
  const paidLease = await createLease({ propertyId: propertyAId, tenantName: 'Paid Tenant', currentRent: '1000' });
  const unpaidLease = await createLease({ propertyId: propertyAId, tenantName: 'Unpaid Tenant', currentRent: '1100' });
  const partLease = await createLease({ propertyId: propertyBId, tenantName: 'Part Paid Tenant', currentRent: '1200' });

  const charges = [
    await chargeRent(paidLease.id, '2025-09'),
    await chargeRent(unpaidLease.id, '2025-09'),
    await chargeRent(partLease.id, '2025-09'),
    await chargeRent(partLease.id, '2025-10')
  ];
  const payments = [await recordPayment(paidLease.id, '1000'), await recordPayment(partLease.id, '500')];

  return { propertyAId, propertyBId, paidLease, unpaidLease, partLease, charges, payments };
};

const ids = (items) => items.map(item => item.id).sort();

const viewRentList = async (query) => {
  const chargesResponse = await request(app).get('/api/v1/get-all-rent-charges').query({ ...query, asOf: AS_OF });
  expect(chargesResponse.statusCode).toBe(200);
  const paymentsResponse = await request(app).get('/api/v1/get-all-rent-payments').query(query);
  expect(paymentsResponse.statusCode).toBe(200);
  const balancesResponse = await request(app).get('/api/v1/get-all-lease-balances').query({ ...query, asOf: AS_OF });
  expect(balancesResponse.statusCode).toBe(200);
  return { charges: chargesResponse.body, payments: paymentsResponse.body, balances: balancesResponse.body };
};

defineFeature(feature, test => {
  test(
    "Given rent charges and payments for leases in two properties, When the PropertyMgr narrows the rent list to one property, Then only that property's charges and payments are listed.",
    ({ given, when, then }) => {
      let setup;
      let view;

      given('rent charges and payments for leases in two properties', async () => {
        setup = await givenTwoProperties();
      });

      when('the PropertyMgr narrows the rent list to one property', async () => {
        view = await viewRentList({ propertyId: setup.propertyAId });
      });

      then("only that property's charges and payments are listed.", () => {
        expect(ids(view.charges)).toEqual(ids(setup.charges.slice(0, 2)));
        expect(ids(view.payments)).toEqual(ids(setup.payments.slice(0, 1)));
        expect(view.balances.map(b => b.leaseId).sort()).toEqual([setup.paidLease.id, setup.unpaidLease.id].sort());
      });
    }
  );

  test(
    "Given rent charges and payments for leases in two properties, When the PropertyMgr narrows the rent list to one lease, Then only that lease's charges and payments are listed.",
    ({ given, when, then }) => {
      let setup;
      let view;

      given('rent charges and payments for leases in two properties', async () => {
        setup = await givenTwoProperties();
      });

      when('the PropertyMgr narrows the rent list to one lease', async () => {
        view = await viewRentList({ leaseId: setup.partLease.id });
      });

      then("only that lease's charges and payments are listed.", () => {
        expect(ids(view.charges)).toEqual(ids(setup.charges.slice(2)));
        expect(ids(view.payments)).toEqual(ids(setup.payments.slice(1)));
        expect(view.balances).toHaveLength(1);
        expect(view.balances[0]).toMatchObject({ leaseId: setup.partLease.id, owed: '1900.00', overdue: '700.00' });
      });
    }
  );

  test(
    'Given rent charges and payments for leases in two properties, When the PropertyMgr views the whole rent list, Then every charge and payment is listed with overdue charges and overdue leases first.',
    ({ given, when, then }) => {
      let setup;
      let view;

      given('rent charges and payments for leases in two properties', async () => {
        setup = await givenTwoProperties();
      });

      when('the PropertyMgr views the whole rent list', async () => {
        view = await viewRentList({});
      });

      then('every charge and payment is listed with overdue charges and overdue leases first.', () => {
        expect(ids(view.charges)).toEqual(expect.arrayContaining(ids(setup.charges)));
        expect(ids(view.payments)).toEqual(expect.arrayContaining(ids(setup.payments)));

        const firstNotOverdueCharge = view.charges.findIndex(charge => !charge.overdue);
        const lastOverdueCharge = view.charges.map(charge => charge.overdue).lastIndexOf(true);
        expect(lastOverdueCharge).toBeGreaterThanOrEqual(0);
        expect(lastOverdueCharge).toBeLessThan(firstNotOverdueCharge);

        const firstNotOverdueLease = view.balances.findIndex(balance => balance.status !== 'Overdue');
        const lastOverdueLease = view.balances.map(balance => balance.status).lastIndexOf('Overdue');
        expect(lastOverdueLease).toBeGreaterThanOrEqual(0);
        expect(lastOverdueLease).toBeLessThan(firstNotOverdueLease);
        expect(view.balances.find(b => b.leaseId === setup.unpaidLease.id).status).toBe('Overdue');
        expect(view.balances.find(b => b.leaseId === setup.paidLease.id).status).toBe('Paid up');
      });
    }
  );
});
