import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getInspection, getTurnoverInspections } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-keeps-the-old-time-given-an-inspection-not-yet-completed.feature'));

defineFeature(feature, test => {
  let turnoverId;
  let inspection;
  let response;

  test(
    'Given a scheduled inspection that is not completed, When the PropertyMgr moves it to another time, Then the inspection keeps its old time and the list shows it as moved from that time.',
    ({ given, when, then }) => {
      given('a scheduled inspection that is not completed', async () => {
        const turnover = await createActiveTurnover();
        turnoverId = turnover.turnoverId;
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00' });
        expect(inspection.completedAt).toBeUndefined();
        // A newly scheduled inspection has not been moved from anywhere.
        expect(inspection.previousScheduledAt).toBeUndefined();
      });

      when('the PropertyMgr moves it to another time', async () => {
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-09-29T14:00',
        });
      });

      then('the inspection keeps its old time and the list shows it as moved from that time.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.scheduledAt).toBe('2025-09-29T14:00');
        expect(response.body.previousScheduledAt).toBe('2025-09-28T09:00');

        const stored = await getInspection(inspection.id);
        expect(stored.scheduledAt).toBe('2025-09-29T14:00');
        expect(stored.previousScheduledAt).toBe('2025-09-28T09:00');

        // Get All Inspections, which the inspection list reads, carries the old time too.
        const inspections = await getTurnoverInspections(turnoverId);
        expect(inspections).toHaveLength(1);
        expect(inspections[0].scheduledAt).toBe('2025-09-29T14:00');
        expect(inspections[0].previousScheduledAt).toBe('2025-09-28T09:00');
      });
    }
  );
});
