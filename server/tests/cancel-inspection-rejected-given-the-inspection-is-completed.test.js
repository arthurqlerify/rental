import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, completeInspection, getInspection } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'cancel-inspection-rejected-given-the-inspection-is-completed.feature'));

defineFeature(feature, test => {
  let inspection;
  let response;

  test(
    'Given an inspection that is already completed, When the PropertyMgr cancels it with a reason, Then the request is refused and the inspection stays completed.',
    ({ given, when, then }) => {
      given('an inspection that is already completed', async () => {
        const turnover = await createActiveTurnover();
        inspection = await scheduleInspection(turnover);
        await completeInspection(inspection);
      });

      when('the PropertyMgr cancels it with a reason', async () => {
        response = await request(app).post('/api/v1/cancel-inspection').send({
          id: inspection.id,
          reason: 'Booked by mistake',
        });
      });

      then('the request is refused and the inspection stays completed.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Inspection with ID ${inspection.id} is already completed.`);

        const stored = await getInspection(inspection.id);
        expect(stored.completedAt).toBe('2025-09-28T10:15');
        expect(stored.cancelledAt).toBeUndefined();
        expect(stored.cancellationReason).toBeUndefined();
      });
    }
  );
});
