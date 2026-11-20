import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getInspection } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-to-another-inspector-given-an-inspection-not-yet-completed.feature'));

defineFeature(feature, test => {
  let inspection;
  let response;

  test(
    'Given a scheduled inspection that is not completed, When the PropertyMgr gives it to another inspector, Then Inspection Rescheduled is recorded with the new inspector at the same time.',
    ({ given, when, then }) => {
      given('a scheduled inspection that is not completed', async () => {
        const turnover = await createActiveTurnover();
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00', assignedToEmail: 'inspector1@rentco.com' });
        expect(inspection.completedAt).toBeUndefined();
      });

      when('the PropertyMgr gives it to another inspector', async () => {
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          assignedToEmail: 'inspector2@rentco.com',
        });
      });

      then('Inspection Rescheduled is recorded with the new inspector at the same time.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.assignedToEmail).toBe('inspector2@rentco.com');
        expect(response.body.scheduledAt).toBe('2025-09-28T09:00');

        const stored = await getInspection(inspection.id);
        expect(stored.assignedToEmail).toBe('inspector2@rentco.com');
        expect(stored.scheduledAt).toBe('2025-09-28T09:00');
        // The time did not change, so the inspection was not moved from anywhere.
        expect(stored.previousScheduledAt).toBeUndefined();
      });
    }
  );
});
