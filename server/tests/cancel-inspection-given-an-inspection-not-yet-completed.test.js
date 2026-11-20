import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getTurnoverInspections } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'cancel-inspection-given-an-inspection-not-yet-completed.feature'));

const REASON = 'Tenant asked to move out a week later';

defineFeature(feature, test => {
  let turnoverId;
  let inspection;
  let response;

  test(
    'Given a scheduled inspection that is not completed, When the PropertyMgr cancels it with a reason, Then Inspection Cancelled is recorded with the reason and the inspection stays in the list marked as cancelled.',
    ({ given, when, then }) => {
      given('a scheduled inspection that is not completed', async () => {
        const turnover = await createActiveTurnover();
        turnoverId = turnover.turnoverId;
        inspection = await scheduleInspection(turnover);
        expect(inspection.completedAt).toBeUndefined();
      });

      when('the PropertyMgr cancels it with a reason', async () => {
        response = await request(app).post('/api/v1/cancel-inspection').send({
          id: inspection.id,
          reason: `  ${REASON} `,
        });
      });

      then('Inspection Cancelled is recorded with the reason and the inspection stays in the list marked as cancelled.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(inspection.id);
        expect(response.body.cancellationReason).toBe(REASON);
        expect(Number.isNaN(Date.parse(response.body.cancelledAt))).toBe(false);

        const inspections = await getTurnoverInspections(turnoverId);
        expect(inspections).toHaveLength(1);
        expect(inspections[0]).toMatchObject({
          id: inspection.id,
          scheduledAt: inspection.scheduledAt,
          assignedToEmail: inspection.assignedToEmail,
          cancelledAt: response.body.cancelledAt,
          cancellationReason: REASON,
        });
        expect(inspections[0].completedAt).toBeUndefined();
      });
    }
  );
});
