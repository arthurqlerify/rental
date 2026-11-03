import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'charge-rent-given-an-active-lease-not-yet-charged-for-the-month.feature'));

const MONTH = '2025-09';

defineFeature(feature, test => {
  test(
    "Given an active lease that has not been charged for the month, When the PropertyMgr charges the month's rent for the lease, Then Rent Charged is recorded for the lease's current rent, due on the 1st of the month.",
    ({ given, when, then }) => {
      let lease;
      let chargeResponse;

      given('an active lease that has not been charged for the month', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Alexandra Nguyen', currentRent: '1450' });

        const chargesResponse = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId: lease.id });
        expect(chargesResponse.statusCode).toBe(200);
        expect(chargesResponse.body).toHaveLength(0);
      });

      when("the PropertyMgr charges the month's rent for the lease", async () => {
        chargeResponse = await request(app)
          .post('/api/v1/charge-rent')
          .send({ leaseId: lease.id, month: MONTH });
      });

      then("Rent Charged is recorded for the lease's current rent, due on the 1st of the month.", async () => {
        expect(chargeResponse.statusCode).toBe(200);
        expect(chargeResponse.body).toMatchObject({
          leaseId: lease.id,
          propertyId: lease.propertyId,
          apartmentId: lease.apartmentId,
          tenantName: 'Alexandra Nguyen',
          month: MONTH,
          dueDate: '2025-09-01',
          amount: '1450.00',
          daysCharged: 30,
          daysInMonth: 30
        });
        expect(typeof chargeResponse.body.id).toBe('string');

        const chargesResponse = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId: lease.id });
        expect(chargesResponse.statusCode).toBe(200);
        expect(chargesResponse.body).toHaveLength(1);
        expect(chargesResponse.body[0]).toMatchObject({
          id: chargeResponse.body.id,
          amount: '1450.00',
          amountPaid: '0.00',
          outstanding: '1450.00',
          status: 'Unpaid'
        });
      });
    }
  );

  test(
    'Given a lease that has already been charged for the month, When the PropertyMgr charges the same month again, Then the request is refused and the lease still has one charge for the month.',
    ({ given, when, then }) => {
      let lease;
      let secondChargeResponse;

      given('a lease that has already been charged for the month', async () => {
        const propertyId = await createProperty();
        lease = await createLease({ propertyId, tenantName: 'Marcus Lee', currentRent: '1200' });

        const firstChargeResponse = await request(app)
          .post('/api/v1/charge-rent')
          .send({ leaseId: lease.id, month: MONTH });
        expect(firstChargeResponse.statusCode).toBe(200);
      });

      when('the PropertyMgr charges the same month again', async () => {
        secondChargeResponse = await request(app)
          .post('/api/v1/charge-rent')
          .send({ leaseId: lease.id, month: MONTH });
      });

      then('the request is refused and the lease still has one charge for the month.', async () => {
        expect(secondChargeResponse.statusCode).toBe(400);
        expect(secondChargeResponse.body.message).toBe(`Rent for ${MONTH} has already been charged for lease ${lease.id}.`);

        const chargesResponse = await request(app).get('/api/v1/get-all-rent-charges').query({ leaseId: lease.id });
        expect(chargesResponse.statusCode).toBe(200);
        expect(chargesResponse.body.filter(charge => charge.month === MONTH)).toHaveLength(1);
      });
    }
  );
});
