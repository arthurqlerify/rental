import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'issue-monthly-rent-charges-given-active-leases-and-an-ended-lease.feature'));

const chargesFor = async (leaseId) => {
  const response = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId });
  expect(response.statusCode).toBe(200);
  return response.body;
};

defineFeature(feature, test => {
  test(
    "Given several active leases and a lease that has ended, When the PropertyMgr issues the month's rent charges, Then each active lease is charged its current rent once and the ended lease is not charged.",
    ({ given, when, then }) => {
      const MONTH = '2025-10';
      let firstLease;
      let secondLease;
      let endedLease;
      let issueResponse;

      given('several active leases and a lease that has ended', async () => {
        const propertyId = await createProperty();
        firstLease = await createLease({ propertyId, tenantName: 'Alexandra Nguyen', currentRent: '1200' });
        secondLease = await createLease({ propertyId, tenantName: 'Marcus Lee', currentRent: '950.50' });
        endedLease = await createLease({
          propertyId,
          tenantName: 'Former Tenant',
          currentRent: '1100',
          endDate: '2025-09-30',
          ended: true
        });
      });

      when("the PropertyMgr issues the month's rent charges", async () => {
        issueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
      });

      then('each active lease is charged its current rent once and the ended lease is not charged.', async () => {
        expect(issueResponse.statusCode).toBe(200);
        expect(issueResponse.body.month).toBe(MONTH);
        const chargedLeaseIds = issueResponse.body.charged.map(charge => charge.leaseId);
        expect(chargedLeaseIds).toEqual(expect.arrayContaining([firstLease.id, secondLease.id]));
        expect(chargedLeaseIds).not.toContain(endedLease.id);

        const firstCharges = await chargesFor(firstLease.id);
        expect(firstCharges).toHaveLength(1);
        expect(firstCharges[0]).toMatchObject({ month: MONTH, dueDate: '2025-10-01', amount: '1200.00' });

        const secondCharges = await chargesFor(secondLease.id);
        expect(secondCharges).toHaveLength(1);
        expect(secondCharges[0]).toMatchObject({ month: MONTH, dueDate: '2025-10-01', amount: '950.50' });

        expect(await chargesFor(endedLease.id)).toHaveLength(0);
      });
    }
  );
});
