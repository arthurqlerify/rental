import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'issue-rent-charges-given-active-leases-not-yet-charged-for-the-month.feature'));

let propertyId;
let unitCount = 0;

const createProperty = async () => {
  const res = await request(app)
    .post('/api/v1/create-property')
    .send({
      name: 'Maple Court',
      address: '30 Rent St',
      managerName: 'Jordan Alvarez',
      managerEmail: 'pm@rentco.com',
      unitsCount: '20',
    });
  expect(res.statusCode).toBe(200);
  return res.body.id;
};

// Creates an apartment and a lease on it, and schedules the lease's end when an end date is given.
const createLease = async ({ tenantName, currentRent, startDate, endDate }) => {
  if (!propertyId) propertyId = await createProperty();
  unitCount += 1;

  const apartmentRes = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `${unitCount}A`, floorAreaSqm: '62', bedrooms: '2', status: 'Vacant' });
  expect(apartmentRes.statusCode).toBe(200);
  const apartmentId = apartmentRes.body.id;

  const leaseRes = await request(app)
    .post('/api/v1/create-lease')
    .send({ apartmentId, startDate, currentRent, nextActorEmail: 'ops@rentco.com', tenantName });
  expect(leaseRes.statusCode).toBe(200);
  expect(leaseRes.body.startDate).toBe(startDate);
  const leaseId = leaseRes.body.id;

  if (endDate) {
    const endRes = await request(app)
      .post('/api/v1/schedule-lease-end')
      .send({ id: leaseId, apartmentId, endDate, noticeDate: '2026-06-01', currentRent, nextActorEmail: 'ops@rentco.com' });
    expect(endRes.statusCode).toBe(200);
  }

  return leaseId;
};

const issueCharges = (month) => request(app).post('/api/v1/issue-rent-charges').send({ month });

const chargesOf = async (leaseId) => {
  const res = await request(app).get(`/api/v1/get-all-rent-charges?leaseId=${leaseId}&asOf=2026-06-01`);
  expect(res.statusCode).toBe(200);
  return res.body;
};

defineFeature(feature, test => {
  let response;

  test(
    "Given active leases that have not been charged for the month, When the PropertyMgr issues the month's rent charges, Then one charge per active lease is recorded, due on the 1st, for the lease's current rent.",
    ({ given, when, then }) => {
      let alexLeaseId;
      let samLeaseId;

      given('active leases that have not been charged for the month', async () => {
        alexLeaseId = await createLease({ tenantName: 'Alex Morgan', currentRent: '1450' });
        samLeaseId = await createLease({ tenantName: 'Sam Lee', currentRent: '1200.50' });
      });

      when("the PropertyMgr issues the month's rent charges", async () => {
        response = await issueCharges('2026-11');
      });

      then("one charge per active lease is recorded, due on the 1st, for the lease's current rent.", async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.month).toBe('2026-11');
        expect(response.body.issued).toHaveLength(2);
        expect(response.body.refused).toEqual([]);

        const expected = [
          { leaseId: alexLeaseId, tenantName: 'Alex Morgan', amount: 1450 },
          { leaseId: samLeaseId, tenantName: 'Sam Lee', amount: 1200.5 },
        ];
        for (const { leaseId, tenantName, amount } of expected) {
          const charges = await chargesOf(leaseId);
          expect(charges).toHaveLength(1);
          expect(charges[0]).toMatchObject({
            leaseId,
            tenantName,
            propertyId,
            month: '2026-11',
            dueDate: '2026-11-01',
            periodStart: '2026-11-01',
            periodEnd: '2026-11-30',
            daysCharged: 30,
            daysInMonth: 30,
            monthlyRent: amount,
            amount,
            amountPaid: 0,
            owed: amount,
          });
        }
      });
    }
  );

  test(
    'Given a lease that starts during the month and a lease that ends during the month, When the PropertyMgr issues the month\'s rent charges, Then each is charged only for the days it runs and leases that do not run that month are not charged.',
    ({ given, when, then }) => {
      let startsLeaseId;
      let startsLateLeaseId;
      let endsLeaseId;
      let endedLeaseId;
      let notStartedLeaseId;

      given('a lease that starts during the month and a lease that ends during the month', async () => {
        startsLeaseId = await createLease({ tenantName: 'Starts Mid Month', currentRent: '1500', startDate: '2026-09-16' });
        startsLateLeaseId = await createLease({ tenantName: 'Starts Late', currentRent: '1000', startDate: '2026-09-21' });
        endsLeaseId = await createLease({ tenantName: 'Ends Early', currentRent: '1200', endDate: '2026-09-10' });
        endedLeaseId = await createLease({ tenantName: 'Ended Before', currentRent: '1000', endDate: '2026-08-31' });
        notStartedLeaseId = await createLease({ tenantName: 'Starts After', currentRent: '900', startDate: '2026-10-01' });
      });

      when("the PropertyMgr issues the month's rent charges", async () => {
        response = await issueCharges('2026-09');
      });

      then('each is charged only for the days it runs and leases that do not run that month are not charged.', async () => {
        expect(response.statusCode).toBe(200);
        const issuedFor = (leaseId) => response.body.issued.find((c) => c.leaseId === leaseId);

        // September has 30 days: the 16th to the 30th is 15 of them
        expect(issuedFor(startsLeaseId)).toMatchObject({
          periodStart: '2026-09-16',
          periodEnd: '2026-09-30',
          daysCharged: 15,
          daysInMonth: 30,
          monthlyRent: 1500,
          amount: 750,
          dueDate: '2026-09-01',
        });
        // 10 of 30 days of 1000, to the cent
        expect(issuedFor(startsLateLeaseId)).toMatchObject({ daysCharged: 10, amount: 333.33 });
        expect(issuedFor(endsLeaseId)).toMatchObject({
          periodStart: '2026-09-01',
          periodEnd: '2026-09-10',
          daysCharged: 10,
          amount: 400,
        });

        expect(issuedFor(endedLeaseId)).toBeUndefined();
        expect(issuedFor(notStartedLeaseId)).toBeUndefined();
        expect(response.body.refused.map((r) => r.leaseId)).not.toContain(endedLeaseId);
        expect(await chargesOf(endedLeaseId)).toEqual([]);
        expect(await chargesOf(notStartedLeaseId)).toEqual([]);
      });
    }
  );

  test(
    'Given every active lease has already been charged for the month, When the PropertyMgr issues the month\'s rent charges again, Then the request is refused and each lease still has one charge for the month.',
    ({ given, when, then }) => {
      let leaseId;

      given('every active lease has already been charged for the month', async () => {
        leaseId = await createLease({ tenantName: 'Charged Once', currentRent: '1100' });
        const firstRes = await issueCharges('2026-08');
        expect(firstRes.statusCode).toBe(200);
        expect(firstRes.body.issued.map((c) => c.leaseId)).toContain(leaseId);
      });

      when("the PropertyMgr issues the month's rent charges again", async () => {
        response = await issueCharges('2026-08');
      });

      then('the request is refused and each lease still has one charge for the month.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Rent for 2026-08 has already been charged for every active lease.');

        const charges = await chargesOf(leaseId);
        expect(charges.filter((c) => c.month === '2026-08')).toHaveLength(1);
      });
    }
  );

  test(
    'Given one lease has already been charged for the month and a new lease has not, When the PropertyMgr issues the month\'s rent charges again, Then only the new lease is charged and charging the other lease again is refused.',
    ({ given, when, then }) => {
      let chargedLeaseId;
      let newLeaseId;

      given('one lease has already been charged for the month and a new lease has not', async () => {
        chargedLeaseId = await createLease({ tenantName: 'Already Charged', currentRent: '1300' });
        const firstRes = await issueCharges('2026-07');
        expect(firstRes.statusCode).toBe(200);
        newLeaseId = await createLease({ tenantName: 'New Tenant', currentRent: '1250' });
      });

      when("the PropertyMgr issues the month's rent charges again", async () => {
        response = await issueCharges('2026-07');
      });

      then('only the new lease is charged and charging the other lease again is refused.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.issued.map((c) => c.leaseId)).toEqual([newLeaseId]);
        expect(response.body.refused).toContainEqual({
          leaseId: chargedLeaseId,
          tenantName: 'Already Charged',
          reason: 'Rent for this month has already been charged.',
        });

        expect((await chargesOf(chargedLeaseId)).filter((c) => c.month === '2026-07')).toHaveLength(1);
        expect((await chargesOf(newLeaseId)).filter((c) => c.month === '2026-07')).toHaveLength(1);
      });
    }
  );
});
