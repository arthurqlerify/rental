import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getInspection } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-rejected-given-the-inspection-is-cancelled.feature'));

defineFeature(feature, test => {
  let inspection;
  let response;

  test(
    'Given an inspection that is cancelled, When the PropertyMgr moves it to another time, Then the request is refused and the inspection stays cancelled at its old time.',
    ({ given, when, then }) => {
      given('an inspection that is cancelled', async () => {
        const turnover = await createActiveTurnover();
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00' });
        const cancelResponse = await request(app).post('/api/v1/cancel-inspection').send({
          id: inspection.id,
          reason: 'Tenant asked to move out a week later',
        });
        expect(cancelResponse.statusCode).toBe(200);
      });

      when('the PropertyMgr moves it to another time', async () => {
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-10-05T09:00',
        });
      });

      then('the request is refused and the inspection stays cancelled at its old time.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Inspection with ID ${inspection.id} is cancelled.`);

        const stored = await getInspection(inspection.id);
        expect(stored.scheduledAt).toBe('2025-09-28T09:00');
        expect(stored.cancelledAt).toBeDefined();
      });
    }
  );
});
