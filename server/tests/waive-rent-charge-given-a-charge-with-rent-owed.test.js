import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'waive-rent-charge-given-a-charge-with-rent-owed.feature'));

let propertyId;
let unitCount = 0;

// Creates a lease and issues the month's rent charges, then returns the lease's charge for that month.
const createChargedLease = async ({ tenantName, currentRent, month }) => {
  if (!propertyId) {
    const propertyRes = await request(app)
      .post('/api/v1/create-property')
      .send({ name: 'Maple Court', address: '33 Rent St', managerName: 'Jordan Alvarez', managerEmail: 'pm@rentco.com', unitsCount: '20' });
    expect(propertyRes.statusCode).toBe(200);
    propertyId = propertyRes.body.id;
  }
  unitCount += 1;

  const apartmentRes = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `${unitCount}D`, floorAreaSqm: '62', bedrooms: '2', status: 'Vacant' });
  expect(apartmentRes.statusCode).toBe(200);

  const leaseRes = await request(app)
    .post('/api/v1/create-lease')
    .send({ apartmentId: apartmentRes.body.id, currentRent, nextActorEmail: 'ops@rentco.com', tenantName });
  expect(leaseRes.statusCode).toBe(200);

  const issueRes = await request(app).post('/api/v1/issue-rent-charges').send({ month });
  expect(issueRes.statusCode).toBe(200);
  const charge = issueRes.body.issued.find((c) => c.leaseId === leaseRes.body.id);
  expect(charge).toBeDefined();
  return charge;
};

const waiveCharge = (waiver) => request(app).post('/api/v1/waive-rent-charge').send(waiver);

// The charge and its lease's balance, as they stand well after the charge was due.
const rentAfter = async (charge) => {
  const chargesRes = await request(app).get(`/api/v1/get-all-rent-charges?leaseId=${charge.leaseId}&asOf=2026-12-31`);
  expect(chargesRes.statusCode).toBe(200);
  const balancesRes = await request(app).get(`/api/v1/get-all-lease-balances?leaseId=${charge.leaseId}&asOf=2026-12-31`);
  expect(balancesRes.statusCode).toBe(200);
  return { charge: chargesRes.body.find((c) => c.id === charge.id), balance: balancesRes.body[0] };
};

defineFeature(feature, test => {
  let charge;
  let response;

  test(
    'Given a rent charge with rent owed, When the PropertyMgr waives the charge with a reason, Then the charge is waived with the reason and nothing is owed for it.',
    ({ given, when, then }) => {
      given('a rent charge with rent owed', async () => {
        charge = await createChargedLease({ tenantName: 'Alex Morgan', currentRent: '1100', month: '2026-02' });
      });

      when('the PropertyMgr waives the charge with a reason', async () => {
        response = await waiveCharge({ id: charge.id, reason: 'No heating for most of February' });
      });

      then('the charge is waived with the reason and nothing is owed for it.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
          id: charge.id,
          waivedReason: 'No heating for most of February',
          waivedAmount: 1100,
        });
        expect(response.body.waivedAt).toBeDefined();

        const { charge: waived, balance } = await rentAfter(charge);
        expect(waived).toMatchObject({ owed: 0, isOverdue: false, status: 'Waived' });
        expect(balance).toMatchObject({ owed: 0, overdue: 0, isOverdue: false, credit: 0 });
      });
    }
  );

  test(
    'Given a rent charge with rent owed, When the PropertyMgr waives the charge without a reason, Then the request is refused and the rent is still owed.',
    ({ given, when, then }) => {
      let responses;

      given('a rent charge with rent owed', async () => {
        charge = await createChargedLease({ tenantName: 'Sam Lee', currentRent: '700', month: '2026-03' });
      });

      when('the PropertyMgr waives the charge without a reason', async () => {
        responses = [await waiveCharge({ id: charge.id }), await waiveCharge({ id: charge.id, reason: '   ' })];
      });

      then('the request is refused and the rent is still owed.', async () => {
        for (const res of responses) {
          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBeDefined();
        }

        const { charge: unchanged, balance } = await rentAfter(charge);
        expect(unchanged.waivedAt).toBeUndefined();
        expect(unchanged).toMatchObject({ owed: 700, status: 'Overdue' });
        expect(balance).toMatchObject({ owed: 700 });
      });
    }
  );

  test(
    'Given a rent charge that has been fully paid, When the PropertyMgr waives the charge, Then the request is refused because nothing is owed for it.',
    ({ given, when, then }) => {
      given('a rent charge that has been fully paid', async () => {
        charge = await createChargedLease({ tenantName: 'Robin Park', currentRent: '600', month: '2026-04' });
        const paymentRes = await request(app)
          .post('/api/v1/record-rent-payment')
          .send({ leaseId: charge.leaseId, amount: '600', paidOn: '2026-04-01', method: 'Card' });
        expect(paymentRes.statusCode).toBe(200);
      });

      when('the PropertyMgr waives the charge', async () => {
        response = await waiveCharge({ id: charge.id, reason: 'Goodwill' });
      });

      then('the request is refused because nothing is owed for it.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('This rent charge is already paid, so there is nothing to waive.');

        const { charge: paid } = await rentAfter(charge);
        expect(paid.waivedAt).toBeUndefined();
        expect(paid.status).toBe('Paid');
      });
    }
  );
});
