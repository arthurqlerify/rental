import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'schedule-inspection-rejected-given-the-turnover-does-not-exist.feature'));

const MISSING_TURNOVER_ID = 'turnover-that-does-not-exist';

defineFeature(feature, test => {
  let apartmentId;
  let response;

  test(
    'Given no turnover exists with the given id, When the PropertyMgr schedules the inspection with a date, time and inspector, Then no Inspection Scheduled is recorded.',
    ({ given, when, then }) => {
      given('no turnover exists with the given id', async () => {
        const propertyRes = await request(app).post('/api/v1/create-property').send({
          name: 'Missing Turnover Court',
          address: '12 Nowhere Lane',
          managerName: 'Jane Doe',
          managerEmail: 'jane.doe@example.com',
          unitsCount: '10',
        });
        expect(propertyRes.statusCode).toBe(200);

        const apartmentRes = await request(app).post('/api/v1/create-apartment').send({
          propertyId: propertyRes.body.id,
          unitNumber: 'NT-1',
          floorAreaSqm: '60',
          bedrooms: '1',
          status: 'Vacant',
        });
        expect(apartmentRes.statusCode).toBe(200);
        apartmentId = apartmentRes.body.id;

        const getAllTurnoversRes = await request(app).get('/api/v1/get-all-turnovers');
        expect(getAllTurnoversRes.statusCode).toBe(200);
        expect(getAllTurnoversRes.body.find(t => t.id === MISSING_TURNOVER_ID)).toBeUndefined();
      });

      when('the PropertyMgr schedules the inspection with a date, time and inspector', async () => {
        response = await request(app).post('/api/v1/schedule-inspection').send({
          turnoverId: MISSING_TURNOVER_ID,
          apartmentId: apartmentId,
          scheduledAt: '2025-09-28T09:00:00.000Z',
          assignedToEmail: 'inspector@rentco.com',
          locationNotes: 'Keys available at front desk.',
          nextActorEmail: 'tenant@ex.com',
        });
      });

      then('no Inspection Scheduled is recorded.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Turnover with ID ${MISSING_TURNOVER_ID} not found.`);

        const getAllInspectionsRes = await request(app).get('/api/v1/get-all-inspections');
        expect(getAllInspectionsRes.statusCode).toBe(200);
        expect(getAllInspectionsRes.body.filter(i => i.turnoverId === MISSING_TURNOVER_ID)).toHaveLength(0);
      });
    }
  );
});
