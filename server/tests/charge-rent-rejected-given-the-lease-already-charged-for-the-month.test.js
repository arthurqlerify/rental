import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'charge-rent-rejected-given-the-lease-already-charged-for-the-month.feature'));

const MONTH = '2025-09';

defineFeature(feature, test => {
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
