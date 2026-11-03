import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'view-rent-given-leases-with-rent-charges-and-payments.feature'));

let unitCount = 0;

const createProperty = async (address) => {
  const res = await request(app)
    .post('/api/v1/create-property')
    .send({ name: 'Maple Court', address, managerName: 'Jordan Alvarez', managerEmail: 'pm@rentco.com', unitsCount: '20' });
  expect(res.statusCode).toBe(200);
  return res.body.id;
};

const createLease = async (propertyId, { tenantName, currentRent, startDate }) => {
  unitCount += 1;
  const apartmentRes = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `${unitCount}E`, floorAreaSqm: '62', bedrooms: '2', status: 'Vacant' });
  expect(apartmentRes.statusCode).toBe(200);

  const leaseRes = await request(app)
    .post('/api/v1/create-lease')
    .send({ apartmentId: apartmentRes.body.id, startDate, currentRent, nextActorEmail: 'ops@rentco.com', tenantName });
  expect(leaseRes.statusCode).toBe(200);
  return leaseRes.body.id;
};

const issueCharges = async (month) => {
  const res = await request(app).post('/api/v1/issue-rent-charges').send({ month });
  expect(res.statusCode).toBe(200);
};

const recordPayment = async (payment) => {
  const res = await request(app).post('/api/v1/record-rent-payment').send(payment);
  expect(res.statusCode).toBe(200);
};

const get = async (url) => {
  const res = await request(app).get(url);
  expect(res.statusCode).toBe(200);
  return res.body;
};

defineFeature(feature, test => {
  let mapleId;
  let lateLeaseId;
  let currentLeaseId;
  let aheadLeaseId;

  test(
    'Given leases with overdue rent, rent not yet overdue and credit, When the PropertyMgr views the lease balances, Then each lease shows what is owed, what is overdue and any credit, with overdue leases first.',
    ({ given, when, then }) => {
      let balances;
      let charges;

      given('leases with overdue rent, rent not yet overdue and credit', async () => {
        mapleId = await createProperty('34 Rent St');
        aheadLeaseId = await createLease(mapleId, { tenantName: 'Paid Ahead', currentRent: '500', startDate: '2026-10-01' });
        currentLeaseId = await createLease(mapleId, { tenantName: 'Not Yet Due', currentRent: '800', startDate: '2026-10-01' });
        lateLeaseId = await createLease(mapleId, { tenantName: 'Behind On Rent', currentRent: '1000' });

        await issueCharges('2026-09'); // Only the lease that started before October
        await issueCharges('2026-10');
        await recordPayment({ leaseId: lateLeaseId, amount: '400', paidOn: '2026-10-02', method: 'Cash' });
        await recordPayment({ leaseId: aheadLeaseId, amount: '700', paidOn: '2026-10-01', method: 'Card' });
      });

      when('the PropertyMgr views the lease balances', async () => {
        balances = await get('/api/v1/get-all-lease-balances?asOf=2026-10-03');
        charges = await get(`/api/v1/get-all-rent-charges?propertyId=${mapleId}&asOf=2026-10-03`);
      });

      then('each lease shows what is owed, what is overdue and any credit, with overdue leases first.', async () => {
        expect(balances).toHaveLength(3);
        // September's charge is overdue, October's is not overdue until the 6th
        expect(balances[0]).toEqual({
          leaseId: lateLeaseId,
          tenantName: 'Behind On Rent',
          propertyId: mapleId,
          apartmentId: expect.any(String),
          owed: 1600,
          overdue: 600,
          credit: 0,
          isOverdue: true,
        });
        expect(balances.find((b) => b.leaseId === currentLeaseId)).toMatchObject({
          owed: 800,
          overdue: 0,
          credit: 0,
          isOverdue: false,
        });
        expect(balances.find((b) => b.leaseId === aheadLeaseId)).toMatchObject({
          owed: 0,
          overdue: 0,
          credit: 200,
          isOverdue: false,
        });

        // The charge list puts the overdue charge first too
        expect(charges[0]).toMatchObject({ leaseId: lateLeaseId, month: '2026-09', isOverdue: true, owed: 600 });
        expect(charges.slice(1).every((c) => !c.isOverdue)).toBe(true);
      });
    }
  );

  test(
    'Given rent charges and payments for leases in two properties, When the PropertyMgr narrows the rent to one property or to one lease, Then only the charges, payments and balances of that property or that lease are listed.',
    ({ given, when, then }) => {
      let oakId;
      let oakLeaseId;
      let narrowed;

      given('rent charges and payments for leases in two properties', async () => {
        oakId = await createProperty('35 Rent St');
        oakLeaseId = await createLease(oakId, { tenantName: 'Oak Tenant', currentRent: '900', startDate: '2026-11-01' });
        await issueCharges('2026-11');
        await recordPayment({ leaseId: oakLeaseId, amount: '900', paidOn: '2026-11-02', method: 'BankTransfer' });
      });

      when('the PropertyMgr narrows the rent to one property or to one lease', async () => {
        narrowed = {
          oakCharges: await get(`/api/v1/get-all-rent-charges?propertyId=${oakId}`),
          oakPayments: await get(`/api/v1/get-all-rent-payments?propertyId=${oakId}`),
          oakBalances: await get(`/api/v1/get-all-lease-balances?propertyId=${oakId}`),
          mapleCharges: await get(`/api/v1/get-all-rent-charges?propertyId=${mapleId}`),
          maplePayments: await get(`/api/v1/get-all-rent-payments?propertyId=${mapleId}`),
          lateCharges: await get(`/api/v1/get-all-rent-charges?leaseId=${lateLeaseId}`),
          latePayments: await get(`/api/v1/get-all-rent-payments?leaseId=${lateLeaseId}`),
          lateBalances: await get(`/api/v1/get-all-lease-balances?leaseId=${lateLeaseId}`),
          allCharges: await get('/api/v1/get-all-rent-charges'),
          allPayments: await get('/api/v1/get-all-rent-payments'),
        };
      });

      then('only the charges, payments and balances of that property or that lease are listed.', async () => {
        const leaseIds = (items) => [...new Set(items.map((i) => i.leaseId))].sort();

        expect(leaseIds(narrowed.oakCharges)).toEqual([oakLeaseId]);
        expect(narrowed.oakCharges).toHaveLength(1);
        expect(leaseIds(narrowed.oakPayments)).toEqual([oakLeaseId]);
        expect(leaseIds(narrowed.oakBalances)).toEqual([oakLeaseId]);

        expect(leaseIds(narrowed.mapleCharges)).toEqual([aheadLeaseId, currentLeaseId, lateLeaseId].sort());
        expect(narrowed.mapleCharges.every((c) => c.propertyId === mapleId)).toBe(true);
        expect(leaseIds(narrowed.maplePayments)).toEqual([aheadLeaseId, lateLeaseId].sort());

        expect(narrowed.lateCharges.map((c) => c.month).sort()).toEqual(['2026-09', '2026-10', '2026-11']);
        expect(leaseIds(narrowed.latePayments)).toEqual([lateLeaseId]);
        expect(leaseIds(narrowed.lateBalances)).toEqual([lateLeaseId]);

        // Without narrowing, every charge and payment is listed
        expect(narrowed.allCharges).toHaveLength(narrowed.oakCharges.length + narrowed.mapleCharges.length);
        expect(narrowed.allPayments).toHaveLength(narrowed.oakPayments.length + narrowed.maplePayments.length);
      });
    }
  );
});
