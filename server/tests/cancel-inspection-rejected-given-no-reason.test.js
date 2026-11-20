import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getInspection } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'cancel-inspection-rejected-given-no-reason.feature'));

defineFeature(feature, test => {
  let inspection;
  let missingReasonResponse;
  let blankReasonResponse;

  test(
    'Given a scheduled inspection that is not completed, When the PropertyMgr cancels it without a reason, Then the request is refused and the inspection is still scheduled.',
    ({ given, when, then }) => {
      given('a scheduled inspection that is not completed', async () => {
        const turnover = await createActiveTurnover();
        inspection = await scheduleInspection(turnover);
      });

      when('the PropertyMgr cancels it without a reason', async () => {
        missingReasonResponse = await request(app).post('/api/v1/cancel-inspection').send({ id: inspection.id });
        blankReasonResponse = await request(app).post('/api/v1/cancel-inspection').send({ id: inspection.id, reason: '   ' });
      });

      then('the request is refused and the inspection is still scheduled.', async () => {
        expect(missingReasonResponse.statusCode).toBe(400);
        expect(missingReasonResponse.body.message).toBe('Missing required fields: id and reason are required.');
        expect(blankReasonResponse.statusCode).toBe(400);
        expect(blankReasonResponse.body.message).toBe('A reason is required to cancel an inspection.');

        const stored = await getInspection(inspection.id);
        expect(stored.cancelledAt).toBeUndefined();
        expect(stored.cancellationReason).toBeUndefined();
        expect(stored.scheduledAt).toBe(inspection.scheduledAt);
      });
    }
  );
});
