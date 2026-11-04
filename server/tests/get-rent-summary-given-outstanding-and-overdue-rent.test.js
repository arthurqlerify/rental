import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'get-rent-summary-given-outstanding-and-overdue-rent.feature'));

const AS_OF = '2025-10-03';

const chargeRent = async (leaseId, month) => {
  const response = await request(app).post('/api/v1/charge-rent').send({ leaseId, month });
  expect(response.statusCode).toBe(200);
};

const recordPayment = async (leaseId, amount) => {
  const response = await request(app)
    .post('/api/v1/record-rent-payment')
    .send({ leaseId, amount, paidOn: '2025-09-02', method: 'Cash' });
  expect(response.statusCode).toBe(200);
};

defineFeature(feature, test => {
  test(
    'Given leases with rent outstanding, rent overdue, rent paid up and credit, When the PropertyMgr views the rental overview, Then it shows the total outstanding rent, the total overdue rent and how many leases are overdue.',
    ({ given, when, then }) => {
      let summaryResponse;

      given('leases with rent outstanding, rent overdue, rent paid up and credit', async () => {
        const propertyId = await createProperty();
        const otherPropertyId = await createProperty();

        // Overdue: September unpaid, 1000 overdue.
        const overdueLease = await createLease({ propertyId, tenantName: 'Overdue Tenant', currentRent: '1000' });
        await chargeRent(overdueLease.id, '2025-09');

        // Overdue in another property: 400 of 900 paid for September, 500 overdue.
        const partLease = await createLease({ propertyId: otherPropertyId, tenantName: 'Part Paid Tenant', currentRent: '900' });
        await chargeRent(partLease.id, '2025-09');
        await recordPayment(partLease.id, '400');

        // Owing: October due on the 1st, not overdue until the 6th.
        const owingLease = await createLease({ propertyId, tenantName: 'Owing Tenant', currentRent: '1200' });
        await chargeRent(owingLease.id, '2025-10');

        // Paid up, and in credit; neither adds to what is owed.
        const paidLease = await createLease({ propertyId, tenantName: 'Paid Tenant', currentRent: '800' });
        await chargeRent(paidLease.id, '2025-09');
        await recordPayment(paidLease.id, '800');
        const creditLease = await createLease({ propertyId, tenantName: 'Credit Tenant', currentRent: '700' });
        await chargeRent(creditLease.id, '2025-09');
        await recordPayment(creditLease.id, '1000');
      });

      when('the PropertyMgr views the rental overview', async () => {
        summaryResponse = await request(app).get('/api/v1/get-rent-summary').query({ asOf: AS_OF });
      });

      then('it shows the total outstanding rent, the total overdue rent and how many leases are overdue.', () => {
        expect(summaryResponse.statusCode).toBe(200);
        expect(summaryResponse.body).toEqual({
          asOf: AS_OF,
          totalOutstanding: '2700.00',
          totalOverdue: '1500.00',
          overdueLeasesCount: 2
        });
      });
    }
  );
});
