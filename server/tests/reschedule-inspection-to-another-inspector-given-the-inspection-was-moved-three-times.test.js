import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, moveInspection, getInspection } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-to-another-inspector-given-the-inspection-was-moved-three-times.feature'));

defineFeature(feature, test => {
  let inspection;
  let response;

  test(
    'Given an inspection that was already moved to another time three times, When the PropertyMgr gives it to another inspector at the same time, Then Inspection Rescheduled is recorded with the new inspector and the inspection still counts three moves.',
    ({ given, when, then }) => {
      given('an inspection that was already moved to another time three times', async () => {
        const turnover = await createActiveTurnover();
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00', assignedToEmail: 'inspector1@rentco.com' });

        await moveInspection(inspection.id, '2025-09-29T09:00');
        await moveInspection(inspection.id, '2025-09-30T09:00');
        const thirdMove = await moveInspection(inspection.id, '2025-10-01T09:00');
        expect(thirdMove.moveCount).toBe(3);
      });

      when('the PropertyMgr gives it to another inspector at the same time', async () => {
        // The Reschedule form sends the time it shows along with the new inspector.
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-10-01T09:00',
          assignedToEmail: 'inspector2@rentco.com',
        });
      });

      then('Inspection Rescheduled is recorded with the new inspector and the inspection still counts three moves.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.assignedToEmail).toBe('inspector2@rentco.com');
        expect(response.body.scheduledAt).toBe('2025-10-01T09:00');
        expect(response.body.moveCount).toBe(3);

        const stored = await getInspection(inspection.id);
        expect(stored.assignedToEmail).toBe('inspector2@rentco.com');
        expect(stored.scheduledAt).toBe('2025-10-01T09:00');
        expect(stored.previousScheduledAt).toBe('2025-09-30T09:00');
        expect(stored.moveCount).toBe(3);
      });
    }
  );
});
