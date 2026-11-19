import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import db from '../src/infrastructure/db/index.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-renovation-report-rejected-given-the-inspection-does-not-exist.feature'));

defineFeature(feature, test => {
  let inspectionId;
  let response;

  test(
    'Given no inspection exists with the given id, When the Inspector itemizes damages with severity, locations and evidence, Then no Damage Report Created is recorded.',
    ({ given, when, then }) => {
      given('no inspection exists with the given id', async () => {
        inspectionId = `missing-inspection-${crypto.randomUUID()}`;
        const inspectionRes = await request(app).get(`/api/v1/get-inspection-by-id/${inspectionId}`);
        expect(inspectionRes.statusCode).not.toBe(200);
      });

      when('the Inspector itemizes damages with severity, locations and evidence', async () => {
        response = await request(app).post('/api/v1/create-renovation-report').send({
          turnoverId: `turnover-${crypto.randomUUID()}`,
          inspectionId: inspectionId,
          apartmentId: `apartment-${crypto.randomUUID()}`,
          damageSeverity: 'high',
          estimatedRepairCost: '1200',
          damageSummary: 'Kitchen sink faucet broken, large scuff on living room wall.',
          nextActorEmail: 'construction@rentco.com',
        });
      });

      then('no Damage Report Created is recorded.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Inspection with ID ${inspectionId} not found.`);

        const reports = await db.findAll('Renovation Report');
        expect(reports.filter(r => r.inspectionId === inspectionId)).toHaveLength(0);
      });
    }
  );
});
