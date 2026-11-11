import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { onDay } from './support/clock.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'mark-lease-ended-rejected-given-today-before-the-scheduled-end-date.feature'));

const LEASE_END_DATE = '2025-09-30';
const TODAY = '2025-09-29'; // One day before the scheduled end date

defineFeature(feature, test => {
  let apartmentId;
  let leaseId;
  let markLeaseEndedResponse;

  test(
    'Given the lease is still active and today comes before its scheduled end date, When Automation marks the lease as ended, Then no Lease Ended is recorded and the lease stays active.',
    ({ given, when, then }) => {
      given('the lease is still active and today comes before its scheduled end date', async () => {
        const propertyResponse = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: 'Test Property for Early Lease End',
            address: '789 Early St',
            managerName: 'Test Manager',
            managerEmail: 'test@example.com',
            unitsCount: '1'
          });
        expect(propertyResponse.statusCode).toBe(200);

        const apartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: propertyResponse.body.id,
            unitNumber: 'EARLY-1',
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
            tenantName: 'Early Tenant'
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
        // The request carries the lease's own end date; only today decides.
        markLeaseEndedResponse = await onDay(TODAY, () =>
          request(app)
            .post('/api/v1/mark-lease-ended')
            .send({
              id: leaseId,
              apartmentId: apartmentId,
              endDate: LEASE_END_DATE,
              moveOutConfirmedAt: `${TODAY}T10:00:00.000Z`,
              nextActorEmail: 'ops@rentco.com'
            })
        );
      });

      then('no Lease Ended is recorded and the lease stays active.', async () => {
        expect(markLeaseEndedResponse.statusCode).toBe(400);
        expect(markLeaseEndedResponse.body.message).toBe(
          `Lease cannot be marked ended: today (${TODAY}) is not its scheduled end date (${LEASE_END_DATE}).`
        );

        const getLeaseResponse = await request(app).get(`/api/v1/get-lease-by-id/${leaseId}`);
        expect(getLeaseResponse.statusCode).toBe(200);
        expect(getLeaseResponse.body.endDate).toBe(LEASE_END_DATE);
        expect(getLeaseResponse.body.moveOutConfirmedAt).toBeUndefined();
      });
    }
  );
});
