import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { onDay } from './support/clock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'mark-lease-ended-given-lease-active-and-end-date-already-passed.feature'));

const LEASE_END_DATE = '2025-09-30';
const TODAY = '2025-10-01'; // One day after the scheduled end date, which the automation missed
const MOVE_OUT_CONFIRMED_AT = `${TODAY}T10:00:00.000Z`;

defineFeature(feature, test => {
  let apartmentId;
  let leaseId;
  let markLeaseEndedResponse;

  test(
    'Given the lease is still active and its scheduled end date has already passed, When Automation marks the lease as ended, Then Lease Ended is recorded.',
    ({ given, when, then }) => {
      given('the lease is still active and its scheduled end date has already passed', async () => {
        const propertyResponse = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: 'Test Property for Late Lease End',
            address: '790 Late St',
            managerName: 'Test Manager',
            managerEmail: 'test@example.com',
            unitsCount: '1'
          });
        expect(propertyResponse.statusCode).toBe(200);

        const apartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: propertyResponse.body.id,
            unitNumber: 'LATE-1',
            floorAreaSqm: '60',
            bedrooms: '2',
            status: 'Vacant'
          });
        expect(apartmentResponse.statusCode).toBe(200);
        apartmentId = apartmentResponse.body.id;

        const createLeaseResponse = await request(app)
          .post('/api/v1/create-lease')
          .send({
            apartmentId: apartmentId,
            currentRent: '1500',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            nextActorEmail: 'ops@rentco.com',
            tenantName: 'Late Tenant'
          });
        expect(createLeaseResponse.statusCode).toBe(200);

        const scheduleLeaseEndResponse = await request(app)
          .post('/api/v1/schedule-lease-end')
          .send({
            id: createLeaseResponse.body.id,
            apartmentId: apartmentId,
            endDate: LEASE_END_DATE,
            noticeDate: '2025-08-01',
            currentRent: '1500',
            nextActorEmail: 'ops@rentco.com'
          });
        expect(scheduleLeaseEndResponse.statusCode).toBe(200);
        leaseId = scheduleLeaseEndResponse.body.id;
        expect(scheduleLeaseEndResponse.body.moveOutConfirmedAt).toBeUndefined();
      });

      when('Automation marks the lease as ended', async () => {
        markLeaseEndedResponse = await onDay(TODAY, () =>
          request(app)
            .post('/api/v1/mark-lease-ended')
            .send({
              id: leaseId,
              apartmentId: apartmentId,
              endDate: LEASE_END_DATE,
              moveOutConfirmedAt: MOVE_OUT_CONFIRMED_AT,
              nextActorEmail: 'ops@rentco.com'
            })
        );
      });

      then('Lease Ended is recorded.', async () => {
        expect(markLeaseEndedResponse.statusCode).toBe(200);
        expect(markLeaseEndedResponse.body.id).toBe(leaseId);
        expect(markLeaseEndedResponse.body.moveOutConfirmedAt).toBe(MOVE_OUT_CONFIRMED_AT);

        const getLeaseResponse = await request(app).get(`/api/v1/get-lease-by-id/${leaseId}`);
        expect(getLeaseResponse.statusCode).toBe(200);
        expect(getLeaseResponse.body.endDate).toBe(LEASE_END_DATE);
        expect(getLeaseResponse.body.moveOutConfirmedAt).toBe(MOVE_OUT_CONFIRMED_AT);
      });
    }
  );
});
