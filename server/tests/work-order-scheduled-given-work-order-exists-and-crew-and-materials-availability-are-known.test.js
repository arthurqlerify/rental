import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'work-order-scheduled-given-work-order-exists-and-crew-and-materials-availability-are-known.feature'));

defineFeature(feature, test => {
  let workOrderId;
  let scheduleWorkOrderResponse;

  const newWorkOrderPayload = {
    renovationCaseId: 'reno-6001',
    turnoverId: 'to-5001',
    apartmentId: 'apt-22B',
    scopeSummary: 'Paint walls, reseal bath',
    materialsList: 'Paint, caulk',
    nextActorEmail: 'crew@rentco.com',
  };

  const scheduleWorkOrderPayload = {
    apartmentId: 'apt-22B',
    startDate: '2025-10-05',
    endDate: '2025-10-10',
    crewName: 'Crew Alpha',
    assignedToEmail: 'lead1@rentco.com',
    materialsReady: 'true',
    nextActorEmail: 'crew@rentco.com',
  };

  test(
    'Given a work order exists and crew and materials availability are known, When the ConstrDept assigns a crew and sets start and end dates, Then Work Order Scheduled is recorded with dates and assigned team.',
    ({ given, when, then }) => {
      given('a work order exists and crew and materials availability are known', async () => {
        const createWorkOrderResponse = await request(app)
          .post('/api/v1/create-work-order')
          .send(newWorkOrderPayload);

        expect(createWorkOrderResponse.statusCode).toBe(200);
        expect(createWorkOrderResponse.body.id).toBeDefined();
        workOrderId = createWorkOrderResponse.body.id;
      });

      when('the ConstrDept assigns a crew and sets start and end dates', async () => {
        scheduleWorkOrderResponse = await request(app)
          .post('/api/v1/schedule-work-order')
          .send({ ...scheduleWorkOrderPayload, id: workOrderId });
      });

      then('Work Order Scheduled is recorded with dates and assigned team', async () => {
        expect(scheduleWorkOrderResponse.statusCode).toBe(200);
        expect(scheduleWorkOrderResponse.body.id).toBe(workOrderId);
        expect(scheduleWorkOrderResponse.body.startDate).toBe(scheduleWorkOrderPayload.startDate);
        expect(scheduleWorkOrderResponse.body.endDate).toBe(scheduleWorkOrderPayload.endDate);
        expect(scheduleWorkOrderResponse.body.crewName).toBe(scheduleWorkOrderPayload.crewName);
        expect(scheduleWorkOrderResponse.body.assignedToEmail).toBe(scheduleWorkOrderPayload.assignedToEmail);
        expect(scheduleWorkOrderResponse.body.materialsReady).toBe(scheduleWorkOrderPayload.materialsReady);
      });
    }
  );
});