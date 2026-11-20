import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createActiveTurnover, scheduleInspection, getTurnoverInspections } from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'schedule-inspection-rejected-given-the-turnover-has-an-open-inspection.feature'));

defineFeature(feature, test => {
  let turnover;
  let openInspection;
  let response;

  test(
    'Given a turnover that already has an inspection that is neither completed nor cancelled, When the PropertyMgr schedules another inspection for it, Then no Inspection Scheduled is recorded and the turnover keeps its one open inspection.',
    ({ given, when, then }) => {
      given('a turnover that already has an inspection that is neither completed nor cancelled', async () => {
        turnover = await createActiveTurnover();
        openInspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00' });
      });

      when('the PropertyMgr schedules another inspection for it', async () => {
        response = await request(app).post('/api/v1/schedule-inspection').send({
          turnoverId: turnover.turnoverId,
          apartmentId: turnover.apartmentId,
          scheduledAt: '2025-09-29T14:00',
          assignedToEmail: 'inspector2@rentco.com',
        });
      });

      then('no Inspection Scheduled is recorded and the turnover keeps its one open inspection.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(
          `Turnover with ID ${turnover.turnoverId} already has an open inspection (${openInspection.id}). Reschedule or cancel it instead.`
        );

        const inspections = await getTurnoverInspections(turnover.turnoverId);
        expect(inspections).toHaveLength(1);
        expect(inspections[0].id).toBe(openInspection.id);
        expect(inspections[0].scheduledAt).toBe('2025-09-28T09:00');
      });
    }
  );
});
