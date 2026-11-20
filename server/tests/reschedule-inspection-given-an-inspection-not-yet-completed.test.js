import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getInspection, getTurnoverInspections } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-given-an-inspection-not-yet-completed.feature'));

defineFeature(feature, test => {
  let turnoverId;
  let inspection;
  let response;

  test(
    'Given a scheduled inspection that is not completed, When the PropertyMgr moves it to another time, Then Inspection Rescheduled is recorded with the new time and the same inspector.',
    ({ given, when, then }) => {
      given('a scheduled inspection that is not completed', async () => {
        const turnover = await createActiveTurnover();
        turnoverId = turnover.turnoverId;
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00', assignedToEmail: 'inspector1@rentco.com' });
        expect(inspection.completedAt).toBeUndefined();
      });

      when('the PropertyMgr moves it to another time', async () => {
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-09-29T14:00',
        });
      });

      then('Inspection Rescheduled is recorded with the new time and the same inspector.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(inspection.id);
        expect(response.body.scheduledAt).toBe('2025-09-29T14:00');
        expect(response.body.assignedToEmail).toBe('inspector1@rentco.com');

        const stored = await getInspection(inspection.id);
        expect(stored.scheduledAt).toBe('2025-09-29T14:00');
        expect(stored.assignedToEmail).toBe('inspector1@rentco.com');
        expect(stored.locationNotes).toBe('Keys at the front desk');

        // The inspection is moved, not copied: the turnover still has just the one.
        const inspections = await getTurnoverInspections(turnoverId);
        expect(inspections).toHaveLength(1);
        expect(inspections[0].scheduledAt).toBe('2025-09-29T14:00');
      });
    }
  );
});
