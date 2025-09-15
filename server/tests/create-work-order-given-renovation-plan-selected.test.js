import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-work-order-given-renovation-plan-selected.feature'));

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let leaseId;
  let turnoverId;
  let inspectionId;
  let renovationCaseId;
  let response;
  let workOrderId;

  const CURRENT_DATE = '2025-09-15T16:56:23.609Z';

  test(
    'Given a renovation plan requiring work has been selected, When the ConstrDept creates a work order with scope, materials and access details, Then Work Order Created is recorded linked to the turnover and renovation case.',
    ({ given, when, then }) => {
      given('a renovation plan requiring work has been selected', async () => {
        // 1. Create Property
        const createPropertyRes = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: 'Renovation Property',
            address: '789 Renovation Blvd',
            managerName: 'Renovation Manager',
            managerEmail: 'reno.manager@example.com',
            unitsCount: '50',
          });
        expect(createPropertyRes.statusCode).toBe(200);
        propertyId = createPropertyRes.body.id;

        // 2. Create Apartment
        const createApartmentRes = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: propertyId,
            unitNumber: 'R101',
            floorAreaSqm: '80',
            bedrooms: '2',
            status: 'Vacant', // Start as vacant for renovation flow
          });
        expect(createApartmentRes.statusCode).toBe(200);
        apartmentId = createApartmentRes.body.id;

        // 3. Schedule Lease End (to get a leaseId and trigger turnover process)
        leaseId = `lease-${Date.now()}`;
        const scheduleLeaseEndRes = await request(app)
          .post('/api/v1/schedule-lease-end')
          .send({
            id: leaseId,
            apartmentId: apartmentId,
            endDate: '2025-10-31', // Future date relative to current, but past for turnover process
            noticeDate: '2025-09-01',
            currentRent: '1800',
            nextActorEmail: 'ops@rentco.com',
          });
        expect(scheduleLeaseEndRes.statusCode).toBe(200);
        leaseId = scheduleLeaseEndRes.body.id;

        // 4. Create Turnover
        const createTurnoverRes = await request(app)
          .post('/api/v1/create-turnover')
          .send({
            leaseId: leaseId,
            apartmentId: apartmentId,
            targetReadyDate: '2025-12-15',
            propertyId: propertyId,
            nextActorEmail: 'inspections@rentco.com',
          });
        expect(createTurnoverRes.statusCode).toBe(200);
        turnoverId = createTurnoverRes.body.id;

        // 5. Record Apartment Vacated
        await request(app)
          .post('/api/v1/record-apartment-vacated')
          .send({
            id: turnoverId,
            apartmentId: apartmentId,
            vacatedAt: '2025-11-01T10:00:00.000Z',
            keysReturned: 'true',
            notes: 'Keys returned, apartment vacant.',
            nextActorEmail: 'inspections@rentco.com',
          });

        // 6. Schedule Inspection
        const scheduleInspectionRes = await request(app)
          .post('/api/v1/schedule-inspection')
          .send({
            turnoverId: turnoverId,
            apartmentId: apartmentId,
            scheduledAt: '2025-11-05T09:00:00.000Z',
            assignedToEmail: 'inspector@example.com',
            locationNotes: 'Front door access',
            nextActorEmail: 'tenant@ex.com',
          });
        expect(scheduleInspectionRes.statusCode).toBe(200);
        inspectionId = scheduleInspectionRes.body.id;

        // 7. Complete Inspection with damages
        await request(app)
          .post('/api/v1/complete-inspection')
          .send({
            id: inspectionId,
            turnoverId: turnoverId,
            apartmentId: apartmentId,
            completedAt: '2025-11-05T10:30:00.000Z',
            findingsSummary: 'Significant damages requiring renovation.',
            hasDamages: 'true',
            photosUrl: 'https://example.com/inspection-photos',
            nextActorEmail: 'constr@rentco.com',
          });

        // 8. Create Renovation Report
        await request(app)
          .post('/api/v1/create-renovation-report')
          .send({
            turnoverId: turnoverId,
            inspectionId: inspectionId,
            apartmentId: apartmentId,
            damageSeverity: 'high',
            estimatedRepairCost: '5000',
            damageSummary: 'Full interior overhaul required.',
            nextActorEmail: 'constr@rentco.com',
          });

        // 9. Request Renovation Estimate
        const requestRenovationEstimateRes = await request(app)
          .post('/api/v1/request-renovation-estimate')
          .send({
            turnoverId: turnoverId,
            apartmentId: apartmentId,
            requestedLevels: 'good,better',
            scopeNotes: 'Repaint, replace flooring, update kitchen.',
            targetReadyDate: '2026-01-30',
            nextActorEmail: 'constr@rentco.com',
          });
        expect(requestRenovationEstimateRes.statusCode).toBe(200);
        renovationCaseId = requestRenovationEstimateRes.body.id;

        // 10. Provide Renovation Estimate
        await request(app)
          .post('/api/v1/provide-renovation-estimate')
          .send({
            id: renovationCaseId,
            costGood: '5000',
            costBetter: '7500',
            costPremium: '10000',
            leadDaysGood: '15',
            leadDaysBetter: '25',
            leadDaysPremium: '35',
            nextActorEmail: 'asset@rentco.com',
          });

        // 11. Select Renovation Plan
        await request(app)
          .post('/api/v1/select-renovation-plan')
          .send({
            id: renovationCaseId,
            apartmentId: apartmentId,
            selectedLevel: 'better',
            budgetApproved: 'true',
            expectedCompletionDate: '2026-01-20',
            projectedRent: '2100',
            decisionReason: 'Optimal ROI at better level.',
            nextActorEmail: 'constr@rentco.com',
          });
      });

      when('the ConstrDept creates a work order with scope, materials and access details', async () => {
        const createWorkOrderPayload = {
          renovationCaseId: renovationCaseId,
          turnoverId: turnoverId,
          apartmentId: apartmentId,
          scopeSummary: 'Full apartment repaint and new LVP flooring',
          accessDetails: 'Access via keybox 7890, code provided daily',
          materialsList: '5 gallons paint (light grey), 10 boxes LVP flooring, 2 gallons primer',
          nextActorEmail: 'crew@rentco.com',
        };

        response = await request(app)
          .post('/api/v1/create-work-order')
          .send(createWorkOrderPayload);
      });

      then('Work Order Created is recorded linked to the turnover and renovation case.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBeDefined();
        expect(response.body.renovationCaseId).toBe(renovationCaseId);
        expect(response.body.turnoverId).toBe(turnoverId);
        expect(response.body.apartmentId).toBe(apartmentId);
        expect(response.body.scopeSummary).toBe('Full apartment repaint and new LVP flooring');
        expect(response.body.accessDetails).toBe('Access via keybox 7890, code provided daily');
        expect(response.body.materialsList).toBe('5 gallons paint (light grey), 10 boxes LVP flooring, 2 gallons primer');
        // nextActorEmail is optional in WorkOrder schema, but often set by the command.
        expect(response.body.nextActorEmail).toBe('crew@rentco.com');


        workOrderId = response.body.id;

        // Verify the work order exists by querying all work orders
        const allWorkOrdersRes = await request(app)
          .get('/api/v1/get-all-work-orders');

        expect(allWorkOrdersRes.statusCode).toBe(200);
        const createdWorkOrder = allWorkOrdersRes.body.find(wo => wo.id === workOrderId);
        expect(createdWorkOrder).toBeDefined();
        expect(createdWorkOrder.renovationCaseId).toBe(renovationCaseId);
        expect(createdWorkOrder.turnoverId).toBe(turnoverId);
        expect(createdWorkOrder.apartmentId).toBe(apartmentId);
        expect(createdWorkOrder.scopeSummary).toBe('Full apartment repaint and new LVP flooring');
        expect(createdWorkOrder.accessDetails).toBe('Access via keybox 7890, code provided daily');
        expect(createdWorkOrder.materialsList).toBe('5 gallons paint (light grey), 10 boxes LVP flooring, 2 gallons primer');
      });
    }
  );
});