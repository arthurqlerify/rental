import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import db from '../src/infrastructure/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-renovation-report-rejected-given-the-inspection-does-not-exist.feature'));

const MISSING_INSPECTION_ID = 'inspection-that-does-not-exist';

defineFeature(feature, test => {
  let apartmentId;
  let response;

  test(
    'Given no inspection exists with the given id, When the Inspector itemizes damages with severity, locations and evidence, Then no Damage Report Created is recorded.',
    ({ given, when, then }) => {
      given('no inspection exists with the given id', async () => {
        const propertyRes = await request(app).post('/api/v1/create-property').send({
          name: 'Missing Inspection Court',
          address: '7 Nowhere Lane',
          managerName: 'Jane Doe',
          managerEmail: 'jane.doe@example.com',
          unitsCount: '10',
        });
        expect(propertyRes.statusCode).toBe(200);

        const apartmentRes = await request(app).post('/api/v1/create-apartment').send({
          propertyId: propertyRes.body.id,
          unitNumber: 'MI-1',
          floorAreaSqm: '60',
          bedrooms: '1',
          status: 'Vacant',
        });
        expect(apartmentRes.statusCode).toBe(200);
        apartmentId = apartmentRes.body.id;

        const getAllInspectionsRes = await request(app).get('/api/v1/get-all-inspections');
        expect(getAllInspectionsRes.statusCode).toBe(200);
        expect(getAllInspectionsRes.body.find(i => i.id === MISSING_INSPECTION_ID)).toBeUndefined();
      });

      when('the Inspector itemizes damages with severity, locations and evidence', async () => {
        response = await request(app).post('/api/v1/create-renovation-report').send({
          turnoverId: 'turnover-for-missing-inspection',
          inspectionId: MISSING_INSPECTION_ID,
          apartmentId: apartmentId,
          damageSeverity: 'high',
          estimatedRepairCost: '1200',
          damageSummary: 'Kitchen sink faucet broken, large scuff on living room wall.',
          nextActorEmail: 'construction@rentco.com',
        });
      });

      then('no Damage Report Created is recorded.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Inspection with ID ${MISSING_INSPECTION_ID} not found.`);

        // There is no read endpoint for renovation reports, so read the store directly.
        const reports = await db.findAll('Renovation Report');
        expect(reports.filter(r => r.inspectionId === MISSING_INSPECTION_ID)).toHaveLength(0);
      });
    }
  );
});
