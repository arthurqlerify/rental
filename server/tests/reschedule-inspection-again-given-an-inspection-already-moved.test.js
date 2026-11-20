import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getTurnoverInspections } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-again-given-an-inspection-already-moved.feature'));

defineFeature(feature, test => {
  let turnoverId;
  let inspection;
  let response;

  test(
    'Given an inspection that was already moved to another time, When the PropertyMgr moves it again, Then the list shows it as moved from the time it had just before.',
    ({ given, when, then }) => {
      given('an inspection that was already moved to another time', async () => {
        const turnover = await createActiveTurnover();
        turnoverId = turnover.turnoverId;
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00' });

        const firstMove = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-09-29T14:00',
        });
        expect(firstMove.statusCode).toBe(200);
        expect(firstMove.body.previousScheduledAt).toBe('2025-09-28T09:00');
      });

      when('the PropertyMgr moves it again', async () => {
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-09-30T08:30',
        });
      });

      then('the list shows it as moved from the time it had just before.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.scheduledAt).toBe('2025-09-30T08:30');
        expect(response.body.previousScheduledAt).toBe('2025-09-29T14:00');

        const inspections = await getTurnoverInspections(turnoverId);
        expect(inspections).toHaveLength(1);
        expect(inspections[0].scheduledAt).toBe('2025-09-30T08:30');
        expect(inspections[0].previousScheduledAt).toBe('2025-09-29T14:00');
      });
    }
  );
});
