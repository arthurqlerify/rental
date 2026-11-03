import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'view-rent-summary-given-leases-with-outstanding-and-overdue-rent.feature'));

let propertyId;
let unitCount = 0;

// Creates an apartment and a lease on it, under one property for the whole feature.
const createLease = async ({ tenantName, currentRent, startDate }) => {
  if (!propertyId) {
    const propertyRes = await request(app)
      .post('/api/v1/create-property')
      .send({ name: 'Maple Court', address: '36 Rent St', managerName: 'Jordan Alvarez', managerEmail: 'pm@rentco.com', unitsCount: '20' });
    expect(propertyRes.statusCode).toBe(200);
    propertyId = propertyRes.body.id;
  }
  unitCount += 1;

  const apartmentRes = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `${unitCount}F`, floorAreaSqm: '62', bedrooms: '2', status: 'Vacant' });
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

const summaryOn = async (asOf) => {
  const res = await request(app).get(`/api/v1/get-rent-summary?asOf=${asOf}`);
  expect(res.statusCode).toBe(200);
  return res.body;
};

defineFeature(feature, test => {
  let beforeOverdue;
  let afterOverdue;

  test(
    'Given leases with overdue rent and rent that is not yet overdue, When the PropertyMgr views the rent summary, Then it shows the total outstanding rent, the total overdue rent and how many leases are overdue.',
    ({ given, when, then }) => {
      given('leases with overdue rent and rent that is not yet overdue', async () => {
        await createLease({ tenantName: 'Behind On Rent', currentRent: '1000' });
        const paidUpLeaseId = await createLease({ tenantName: 'Paid Up For March', currentRent: '600' });
        await createLease({ tenantName: 'Moved In April', currentRent: '400', startDate: '2026-04-01' });

        await issueCharges('2026-03');
        await issueCharges('2026-04');
        const paymentRes = await request(app)
          .post('/api/v1/record-rent-payment')
          .send({ leaseId: paidUpLeaseId, amount: '600', paidOn: '2026-03-03', method: 'BankTransfer' });
        expect(paymentRes.statusCode).toBe(200);
      });

      when('the PropertyMgr views the rent summary', async () => {
        beforeOverdue = await summaryOn('2026-04-03');
        afterOverdue = await summaryOn('2026-04-06');
      });

      then('it shows the total outstanding rent, the total overdue rent and how many leases are overdue.', async () => {
        // March's 1000 is overdue; April's charges (1000 + 600 + 400) are not overdue until the 6th
        expect(beforeOverdue).toEqual({
          asOf: '2026-04-03',
          totalOutstanding: 3000,
          totalOverdue: 1000,
          overdueLeaseCount: 1,
        });
        expect(afterOverdue).toEqual({
          asOf: '2026-04-06',
          totalOutstanding: 3000,
          totalOverdue: 3000,
          overdueLeaseCount: 3,
        });

        const badRes = await request(app).get('/api/v1/get-rent-summary?asOf=April');
        expect(badRes.statusCode).toBe(400);
      });
    }
  );
});
