import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'schedule-inspection-rejected-given-the-turnover-is-already-completed.feature'));

const READY_TO_RENT_DATE = '2025-10-20';

defineFeature(feature, test => {
  let apartmentId;
  let turnoverId;
  let response;

  test(
    'Given a turnover that is already completed with a ready-to-rent date, When the PropertyMgr schedules the inspection with a date, time and inspector, Then no Inspection Scheduled is recorded.',
    ({ given, when, then }) => {
      given('a turnover that is already completed with a ready-to-rent date', async () => {
        const propertyRes = await request(app).post('/api/v1/create-property').send({
          name: 'Completed Turnover Plaza',
          address: '34 Done Street',
          managerName: 'Jane Doe',
          managerEmail: 'jane.doe@example.com',
          unitsCount: '10',
        });
        expect(propertyRes.statusCode).toBe(200);
        const propertyId = propertyRes.body.id;

        const apartmentRes = await request(app).post('/api/v1/create-apartment').send({
          propertyId: propertyId,
          unitNumber: 'CT-1',
          floorAreaSqm: '70',
          bedrooms: '2',
          status: 'Vacant',
        });
        expect(apartmentRes.statusCode).toBe(200);
        apartmentId = apartmentRes.body.id;

        const createLeaseRes = await request(app).post('/api/v1/create-lease').send({
          apartmentId: apartmentId,
          currentRent: '1800',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          nextActorEmail: 'ops@rentco.com',
          tenantName: 'Chris Park',
        });
        expect(createLeaseRes.statusCode).toBe(200);
        const leaseId = createLeaseRes.body.id;

        const scheduleLeaseEndRes = await request(app).post('/api/v1/schedule-lease-end').send({
          id: leaseId,
          apartmentId: apartmentId,
          endDate: '2025-09-30',
          noticeDate: '2025-08-01',
          currentRent: '1800',
          nextActorEmail: 'ops@rentco.com',
        });
        expect(scheduleLeaseEndRes.statusCode).toBe(200);

        const turnoverRes = await request(app).post('/api/v1/create-turnover').send({
          leaseId: leaseId,
          apartmentId: apartmentId,
          targetReadyDate: '2025-10-15',
          propertyId: propertyId,
          nextActorEmail: 'inspections@rentco.com',
        });
        expect(turnoverRes.statusCode).toBe(200);
        turnoverId = turnoverRes.body.id;

        const completeTurnoverRes = await request(app).post('/api/v1/complete-turnover').send({
          id: turnoverId,
          readyToRentDate: READY_TO_RENT_DATE,
          listingReady: 'true',
          marketingEmail: 'marketing@rentco.com',
          apartmentId: apartmentId,
          notes: 'Apartment is ready to rent.',
        });
        expect(completeTurnoverRes.statusCode).toBe(200);
        expect(completeTurnoverRes.body.readyToRentDate).toBe(READY_TO_RENT_DATE);
      });

      when('the PropertyMgr schedules the inspection with a date, time and inspector', async () => {
        response = await request(app).post('/api/v1/schedule-inspection').send({
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          scheduledAt: '2025-10-25T09:00:00.000Z',
          assignedToEmail: 'inspector@rentco.com',
          locationNotes: 'Keys available at front desk.',
          nextActorEmail: 'tenant@ex.com',
        });
      });

      then('no Inspection Scheduled is recorded.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Turnover with ID ${turnoverId} is already completed.`);

        const getAllInspectionsRes = await request(app).get('/api/v1/get-all-inspections');
        expect(getAllInspectionsRes.statusCode).toBe(200);
        expect(getAllInspectionsRes.body.filter(i => i.turnoverId === turnoverId)).toHaveLength(0);
      });
    }
  );
});
