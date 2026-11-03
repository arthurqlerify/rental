import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'rent-charge-overdue-given-not-fully-paid-5-days-after-due-date.feature'));

let propertyId;
let unitCount = 0;

// Creates an apartment and a lease on it, under one property for the whole feature.
const createLease = async ({ tenantName, currentRent }) => {
  if (!propertyId) {
    const propertyRes = await request(app)
      .post('/api/v1/create-property')
      .send({ name: 'Maple Court', address: '32 Rent St', managerName: 'Jordan Alvarez', managerEmail: 'pm@rentco.com', unitsCount: '20' });
    expect(propertyRes.statusCode).toBe(200);
    propertyId = propertyRes.body.id;
  }
  unitCount += 1;

  const apartmentRes = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `${unitCount}C`, floorAreaSqm: '62', bedrooms: '2', status: 'Vacant' });
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

const recordPayment = async (payment) => {
  const res = await request(app).post('/api/v1/record-rent-payment').send(payment);
  expect(res.statusCode).toBe(200);
};

// The lease's charge for the month and the lease's balance, as they stand on the given day.
const rentOn = async (leaseId, month, asOf) => {
  const chargesRes = await request(app).get(`/api/v1/get-all-rent-charges?leaseId=${leaseId}&asOf=${asOf}`);
  expect(chargesRes.statusCode).toBe(200);
  const balancesRes = await request(app).get(`/api/v1/get-all-lease-balances?leaseId=${leaseId}&asOf=${asOf}`);
  expect(balancesRes.statusCode).toBe(200);
  return { charge: chargesRes.body.find((c) => c.month === month), balance: balancesRes.body[0] };
};

defineFeature(feature, test => {
  let leaseId;
  let fourDaysAfter;
  let fiveDaysAfter;

  test(
    'Given a rent charge that is not fully paid, When 5 days have passed since its due date, Then the charge and its lease are overdue, and were not the day before.',
    ({ given, when, then }) => {
      given('a rent charge that is not fully paid', async () => {
        leaseId = await createLease({ tenantName: 'Alex Morgan', currentRent: '1200' });
        await issueCharges('2026-05');
        await recordPayment({ leaseId, amount: '200', paidOn: '2026-05-02', method: 'Cash' });
      });

      when("the PropertyMgr views the rent 4 days and 5 days after the charge's due date", async () => {
        fourDaysAfter = await rentOn(leaseId, '2026-05', '2026-05-05');
        fiveDaysAfter = await rentOn(leaseId, '2026-05', '2026-05-06');
      });

      then('the charge and its lease are overdue 5 days after the due date, and were not 4 days after it.', async () => {
        expect(fourDaysAfter.charge).toMatchObject({
          dueDate: '2026-05-01',
          overdueFrom: '2026-05-06',
          owed: 1000,
          isOverdue: false,
          status: 'Part paid',
        });
        expect(fourDaysAfter.balance).toMatchObject({ owed: 1000, overdue: 0, isOverdue: false });

        expect(fiveDaysAfter.charge).toMatchObject({ owed: 1000, isOverdue: true, status: 'Overdue' });
        expect(fiveDaysAfter.balance).toMatchObject({ owed: 1000, overdue: 1000, isOverdue: true });
      });
    }
  );

  test(
    'Given a rent charge that has been fully paid, When more than 5 days have passed since its due date, Then the charge and its lease are not overdue.',
    ({ given, when, then }) => {
      let later;

      given('a rent charge that has been fully paid', async () => {
        leaseId = await createLease({ tenantName: 'Sam Lee', currentRent: '950' });
        await issueCharges('2026-06');
        await recordPayment({ leaseId, amount: '950', paidOn: '2026-06-08', method: 'BankTransfer' });
      });

      when("the PropertyMgr views the rent more than 5 days after the charge's due date", async () => {
        later = await rentOn(leaseId, '2026-06', '2026-06-20');
      });

      then('the charge and its lease are not overdue.', async () => {
        expect(later.charge).toMatchObject({ owed: 0, isOverdue: false, status: 'Paid' });
        expect(later.balance).toMatchObject({ owed: 0, overdue: 0, isOverdue: false });
      });
    }
  );
});
