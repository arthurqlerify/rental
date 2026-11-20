import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, completeInspection, getInspection } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'reschedule-inspection-rejected-given-the-inspection-is-completed.feature'));

defineFeature(feature, test => {
  let inspection;
  let response;

  test(
    'Given an inspection that is already completed, When the PropertyMgr moves it to another time and another inspector, Then the request is refused and the inspection keeps its time and inspector.',
    ({ given, when, then }) => {
      given('an inspection that is already completed', async () => {
        const turnover = await createActiveTurnover();
        inspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00', assignedToEmail: 'inspector1@rentco.com' });
        await completeInspection(inspection);
      });

      when('the PropertyMgr moves it to another time and another inspector', async () => {
        response = await request(app).post('/api/v1/reschedule-inspection').send({
          id: inspection.id,
          scheduledAt: '2025-09-29T14:00',
          assignedToEmail: 'inspector2@rentco.com',
        });
      });

      then('the request is refused and the inspection keeps its time and inspector.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Inspection with ID ${inspection.id} is already completed.`);

        const stored = await getInspection(inspection.id);
        expect(stored.scheduledAt).toBe('2025-09-28T09:00');
        expect(stored.assignedToEmail).toBe('inspector1@rentco.com');
      });
    }
  );
});
