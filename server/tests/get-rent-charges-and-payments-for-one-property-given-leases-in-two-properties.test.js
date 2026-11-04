import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'get-rent-charges-and-payments-for-one-property-given-leases-in-two-properties.feature'));

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
});
