import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import db from '../src/infrastructure/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-renovation-report-rejected-given-the-inspection-is-not-completed.feature'));

defineFeature(feature, test => {
  let apartmentId;
  let turnoverId;
  let inspectionId;
  let response;

  test(
    'Given an inspection that is scheduled but not yet completed, When the Inspector itemizes damages with severity, locations and evidence, Then no Damage Report Created is recorded.',
    ({ given, when, then }) => {
      given('an inspection that is scheduled but not yet completed', async () => {
        const propertyRes = await request(app).post('/api/v1/create-property').send({
          name: 'Damage Report Plaza',
          address: '12 Report Street',
          managerName: 'Jane Doe',
          managerEmail: 'jane.doe@example.com',
          unitsCount: '10',
        });
        expect(propertyRes.statusCode).toBe(200);
        const propertyId = propertyRes.body.id;

        const apartmentRes = await request(app).post('/api/v1/create-apartment').send({
          propertyId: propertyId,
          unitNumber: 'NC-1',
          floorAreaSqm: '70',
          bedrooms: '2',
          status: 'Vacant',
        });
        expect(apartmentRes.statusCode).toBe(200);
        apartmentId = apartmentRes.body.id;

        const createLeaseRes = await request(app).post('/api/v1/create-lease').send({
          apartmentId: apartmentId,
          currentRent: '1800',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          nextActorEmail: 'ops@rentco.com',
          tenantName: 'Chris Park',
        });
        expect(createLeaseRes.statusCode).toBe(200);
        const leaseId = createLeaseRes.body.id;

        const scheduleLeaseEndRes = await request(app).post('/api/v1/schedule-lease-end').send({
          id: leaseId,
          apartmentId: apartmentId,
          endDate: '2025-09-30',
          noticeDate: '2025-08-01',
          currentRent: '1800',
          nextActorEmail: 'ops@rentco.com',
        });
        expect(scheduleLeaseEndRes.statusCode).toBe(200);

        const turnoverRes = await request(app).post('/api/v1/create-turnover').send({
          leaseId: leaseId,
          apartmentId: apartmentId,
          targetReadyDate: '2025-10-15',
          propertyId: propertyId,
          nextActorEmail: 'inspections@rentco.com',
        });
        expect(turnoverRes.statusCode).toBe(200);
        turnoverId = turnoverRes.body.id;

        const scheduleInspectionRes = await request(app).post('/api/v1/schedule-inspection').send({
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          scheduledAt: '2025-10-01T09:00:00.000Z',
          assignedToEmail: 'inspector@rentco.com',
          locationNotes: 'Keys available at front desk.',
          nextActorEmail: 'tenant@ex.com',
        });
        expect(scheduleInspectionRes.statusCode).toBe(200);
        inspectionId = scheduleInspectionRes.body.id;
        expect(scheduleInspectionRes.body.completedAt).toBeUndefined();
      });

      when('the Inspector itemizes damages with severity, locations and evidence', async () => {
        response = await request(app).post('/api/v1/create-renovation-report').send({
          turnoverId: turnoverId,
          inspectionId: inspectionId,
          apartmentId: apartmentId,
          damageSeverity: 'high',
          estimatedRepairCost: '1200',
          damageSummary: 'Kitchen sink faucet broken, large scuff on living room wall.',
          nextActorEmail: 'construction@rentco.com',
        });
      });

      then('no Damage Report Created is recorded.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Inspection with ID ${inspectionId} is not completed.`);

        const reports = await db.findAll('Renovation Report');
        expect(reports.filter(r => r.inspectionId === inspectionId)).toHaveLength(0);
      });
    }
  );
});
