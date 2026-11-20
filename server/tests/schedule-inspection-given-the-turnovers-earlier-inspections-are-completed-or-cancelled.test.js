import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import {
  createActiveTurnover,
  scheduleInspection,
  completeInspection,
  getTurnoverInspections,
} from './support/inspectionFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'schedule-inspection-given-the-turnovers-earlier-inspections-are-completed-or-cancelled.feature'));

defineFeature(feature, test => {
  let turnover;
  let completedInspection;
  let cancelledInspection;
  let response;

  test(
    "Given a turnover whose earlier inspections are completed or cancelled, When the PropertyMgr schedules the inspection with a date, time and inspector, Then Inspection Scheduled is recorded and it is the turnover's only open inspection.",
    ({ given, when, then }) => {
      given('a turnover whose earlier inspections are completed or cancelled', async () => {
        turnover = await createActiveTurnover();

        completedInspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-09-28T09:00' });
        await completeInspection(completedInspection);

        cancelledInspection = await scheduleInspection({ ...turnover, scheduledAt: '2025-10-10T09:00' });
        const cancelResponse = await request(app).post('/api/v1/cancel-inspection').send({
          id: cancelledInspection.id,
          reason: 'Inspector off sick',
        });
        expect(cancelResponse.statusCode).toBe(200);
      });

      when('the PropertyMgr schedules the inspection with a date, time and inspector', async () => {
        response = await request(app).post('/api/v1/schedule-inspection').send({
          turnoverId: turnover.turnoverId,
          apartmentId: turnover.apartmentId,
          scheduledAt: '2025-10-12T09:00',
          assignedToEmail: 'inspector2@rentco.com',
        });
      });

      then("Inspection Scheduled is recorded and it is the turnover's only open inspection.", async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.scheduledAt).toBe('2025-10-12T09:00');
        expect(response.body.assignedToEmail).toBe('inspector2@rentco.com');

        const inspections = await getTurnoverInspections(turnover.turnoverId);
        expect(inspections.map((i) => i.id).sort()).toEqual(
          [completedInspection.id, cancelledInspection.id, response.body.id].sort()
        );
        const open = inspections.filter((i) => !i.completedAt && !i.cancelledAt);
        expect(open.map((i) => i.id)).toEqual([response.body.id]);
      });
    }
  );
});
