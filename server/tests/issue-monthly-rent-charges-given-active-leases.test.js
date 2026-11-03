import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'issue-monthly-rent-charges-given-active-leases.feature'));

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

  test(
    "Given a lease that starts during the month, When the PropertyMgr issues the month's rent charges, Then the lease is charged only for the days from its start date, due on that date.",
    ({ given, when, then }) => {
      const MONTH = '2025-11';
      let lease;
      let issueResponse;

      given('a lease that starts during the month', async () => {
        const propertyId = await createProperty();
        // November has 30 days; from the 21st the lease runs for 10 of them.
        lease = await createLease({ propertyId, tenantName: 'New Tenant', currentRent: '1500', startDate: '2025-11-21' });
        expect(lease.startDate).toBe('2025-11-21');
      });

      when("the PropertyMgr issues the month's rent charges", async () => {
        issueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
      });

      then('the lease is charged only for the days from its start date, due on that date.', async () => {
        expect(issueResponse.statusCode).toBe(200);

        const charges = await chargesFor(lease.id);
        expect(charges).toHaveLength(1);
        expect(charges[0]).toMatchObject({
          month: MONTH,
          dueDate: '2025-11-21',
          amount: '500.00',
          daysCharged: 10,
          daysInMonth: 30
        });
      });
    }
  );

  test(
    "Given a lease that ends during the month, When the PropertyMgr issues the month's rent charges, Then the lease is charged only for the days up to its end date, due on the 1st.",
    ({ given, when, then }) => {
      const MONTH = '2025-12';
      let lease;
      let issueResponse;

      given('a lease that ends during the month', async () => {
        const propertyId = await createProperty();
        // December has 31 days; up to the 10th the lease runs for 10 of them.
        lease = await createLease({ propertyId, tenantName: 'Leaving Tenant', currentRent: '3100', endDate: '2025-12-10' });
      });

      when("the PropertyMgr issues the month's rent charges", async () => {
        issueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
      });

      then('the lease is charged only for the days up to its end date, due on the 1st.', async () => {
        expect(issueResponse.statusCode).toBe(200);

        const charges = await chargesFor(lease.id);
        expect(charges).toHaveLength(1);
        expect(charges[0]).toMatchObject({
          month: MONTH,
          dueDate: '2025-12-01',
          amount: '1000.00',
          daysCharged: 10,
          daysInMonth: 31
        });
      });
    }
  );

  test(
    "Given the month's rent charges have already been issued, When the PropertyMgr issues the month's rent charges again, Then the request is refused and no lease is charged twice for the month.",
    ({ given, when, then }) => {
      const MONTH = '2026-01';
      let lease;
      let secondIssueResponse;

      given("the month's rent charges have already been issued", async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Steady Tenant', currentRent: '1300' });

        const firstIssueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
        expect(firstIssueResponse.statusCode).toBe(200);
        expect(firstIssueResponse.body.charged.map(charge => charge.leaseId)).toContain(lease.id);
      });

      when("the PropertyMgr issues the month's rent charges again", async () => {
        secondIssueResponse = await request(app)
          .post('/api/v1/issue-monthly-rent-charges')
          .send({ month: MONTH });
      });

      then('the request is refused and no lease is charged twice for the month.', async () => {
        expect(secondIssueResponse.statusCode).toBe(400);
        expect(secondIssueResponse.body.message).toBe(`Rent for ${MONTH} has already been charged for every active lease.`);

        const allChargesResponse = await request(app).get('/api/v1/get-all-rent-charges');
        expect(allChargesResponse.statusCode).toBe(200);
        const monthCharges = allChargesResponse.body.filter(charge => charge.month === MONTH);
        const leaseIds = monthCharges.map(charge => charge.leaseId);
        expect(leaseIds).toContain(lease.id);
        expect(new Set(leaseIds).size).toBe(leaseIds.length);
      });
    }
  );
});
