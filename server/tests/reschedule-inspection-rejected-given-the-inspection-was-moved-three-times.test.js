import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, moveInspection, getInspection } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-rejected-given-the-inspection-was-moved-three-times.feature'));

defineFeature(feature, test => {
  let inspection;
  let response;

  test(
    'Given an inspection that was already moved to another time three times, When the PropertyMgr moves it again, Then the request is refused and the inspection keeps its time and its three moves.',
    ({ given, when, then }) => {
      given('an inspection that was already moved to another time three times', async () => {
        const turnover = await createActiveTurnover();
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00', assignedToEmail: 'inspector1@rentco.com' });

        await moveInspection(inspection.id, '2025-09-29T09:00');
        await moveInspection(inspection.id, '2025-09-30T09:00');
        const thirdMove = await moveInspection(inspection.id, '2025-10-01T09:00');
        expect(thirdMove.moveCount).toBe(3);
        expect(thirdMove.previousScheduledAt).toBe('2025-09-30T09:00');
      });

      when('the PropertyMgr moves it again', async () => {
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-10-02T09:00',
          assignedToEmail: 'inspector2@rentco.com',
        });
      });

      then('the request is refused and the inspection keeps its time and its three moves.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(
          `Inspection with ID ${inspection.id} was already moved 3 times and cannot be moved again.`
        );

        // Nothing of the refused request is kept, not even the new inspector.
        const stored = await getInspection(inspection.id);
        expect(stored.scheduledAt).toBe('2025-10-01T09:00');
        expect(stored.previousScheduledAt).toBe('2025-09-30T09:00');
        expect(stored.moveCount).toBe(3);
        expect(stored.assignedToEmail).toBe('inspector1@rentco.com');
      });
    }
  );
});
