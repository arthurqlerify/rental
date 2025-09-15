import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'select-renovation-plan.feature'));

// Constants for test data
const PROPERTY_ID = 'prop-001';
const APARTMENT_ID = 'apt-22B';
const LEASE_ID = 'lease-1001';
const TURNOVER_ID = 'to-5001';
const RENOVATION_CASE_ID = 'reno-6001';

const PROPERTY_NAME = 'Maple Court';
const PROPERTY_ADDRESS = '12 Main St';
const PROPERTY_MANAGER_NAME = 'Jordan Alvarez';
const PROPERTY_MANAGER_EMAIL = 'pm@rentco.com';
const PROPERTY_UNITS_COUNT = '120';

const APARTMENT_UNIT_NUMBER = '22B';
const APARTMENT_FLOOR_AREA = '62';
const APARTMENT_BEDROOMS = '2';
const APARTMENT_STATUS = 'Occupied';

const LEASE_END_DATE = '2025-09-30';
const LEASE_NOTICE_DATE = '2025-08-01';
const LEASE_CURRENT_RENT = '1450';
const LEASE_NEXT_ACTOR_EMAIL = 'ops@rentco.com';
const LEASE_TENANT_NAME = 'Alexandra Nguyen';

const TURNOVER_TARGET_READY_DATE = '2025-10-15'; // Base for completion date calculation
const TURNOVER_NEXT_ACTOR_EMAIL = 'inspections@rentco.com';

const RENOVATION_REQUESTED_LEVELS = 'good,better,premium';
const RENOVATION_SCOPE_NOTES = 'Paint + bath reseal';
const RENOVATION_NEXT_ACTOR_EMAIL_CONSTR = 'constr@rentco.com';
const RENOVATION_COST_GOOD = '1200';
const RENOVATION_COST_BETTER = '1800';
const RENOVATION_COST_PREMIUM = '3000';
const RENOVATION_LEAD_DAYS_GOOD = '5';
const RENOVATION_LEAD_DAYS_BETTER = '8';
const RENOVATION_LEAD_DAYS_PREMIUM = '12';

// Function to calculate expected completion date
const calculateExpectedCompletionDate = (targetReadyDate, leadDays) => {
  const date = new Date(targetReadyDate);
  date.setDate(date.getDate() + parseInt(leadDays, 10));
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Global variables to store responses
let whenResponse; // The response from the 'When' step

defineFeature(feature, test => {
  test(
    'Given estimate options and projected rent uplift are available, When the PropertyMgr selects one plan level or chooses no renovation, Then Renovation Plan Selected is recorded with the chosen level, budget and expected completion window.',
    ({ given, when, then }) => {
      given('estimate options and projected rent uplift are available', async () => {
        // Create Property
        const propertyRes = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: PROPERTY_NAME,
            address: PROPERTY_ADDRESS,
            managerName: PROPERTY_MANAGER_NAME,
            managerEmail: PROPERTY_MANAGER_EMAIL,
            unitsCount: PROPERTY_UNITS_COUNT,
          });
        expect(propertyRes.statusCode).toBe(200);

        // Create Apartment
        const apartmentRes = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: PROPERTY_ID,
            unitNumber: APARTMENT_UNIT_NUMBER,
            floorAreaSqm: APARTMENT_FLOOR_AREA,
            bedrooms: APARTMENT_BEDROOMS,
            status: APARTMENT_STATUS,
          });
        expect(apartmentRes.statusCode).toBe(200);

        // Schedule Lease End
        const leaseRes = await request(app)
          .post('/api/v1/schedule-lease-end')
          .send({
            id: LEASE_ID,
            apartmentId: APARTMENT_ID,
            endDate: LEASE_END_DATE,
            noticeDate: LEASE_NOTICE_DATE,
            currentRent: LEASE_CURRENT_RENT,
            nextActorEmail: LEASE_NEXT_ACTOR_EMAIL,
          });
        expect(leaseRes.statusCode).toBe(200);

        // Create Turnover
        const turnoverRes = await request(app)
          .post('/api/v1/create-turnover')
          .send({
            leaseId: LEASE_ID,
            apartmentId: APARTMENT_ID,
            targetReadyDate: TURNOVER_TARGET_READY_DATE,
            propertyId: PROPERTY_ID,
            nextActorEmail: TURNOVER_NEXT_ACTOR_EMAIL,
          });
        expect(turnoverRes.statusCode).toBe(200);

        // Request Renovation Estimate (initial RenovationCase creation)
        const renovationCaseRes = await request(app)
          .post('/api/v1/request-renovation-estimate')
          .send({
            turnoverId: TURNOVER_ID,
            apartmentId: APARTMENT_ID,
            requestedLevels: RENOVATION_REQUESTED_LEVELS,
            scopeNotes: RENOVATION_SCOPE_NOTES,
            targetReadyDate: TURNOVER_TARGET_READY_DATE, // RenovationCase targetReadyDate should match Turnover
            nextActorEmail: RENOVATION_NEXT_ACTOR_EMAIL_CONSTR,
          });
        expect(renovationCaseRes.statusCode).toBe(200);
        expect(renovationCaseRes.body.id).toBe(RENOVATION_CASE_ID);

        // Provide Renovation Estimate (populate cost and lead day options)
        const provideEstimateRes = await request(app)
          .post('/api/v1/provide-renovation-estimate')
          .send({
            id: RENOVATION_CASE_ID,
            costGood: RENOVATION_COST_GOOD,
            costBetter: RENOVATION_COST_BETTER,
            costPremium: RENOVATION_COST_PREMIUM,
            leadDaysGood: RENOVATION_LEAD_DAYS_GOOD,
            leadDaysBetter: RENOVATION_LEAD_DAYS_BETTER,
            leadDaysPremium: RENOVATION_LEAD_DAYS_PREMIUM,
            nextActorEmail: RENOVATION_NEXT_ACTOR_EMAIL_CONSTR,
          });
        expect(provideEstimateRes.statusCode).toBe(200);
        // At this point, the RenovationCase should have estimate options.
        // The 'projected rent uplift are available' means the PM has this info
        // and provides it in the next step, as per OpenAPI spec.
      });

      when(
        /^the PropertyMgr selects one plan level as "([^"]*)" with budget approved and a projected rent of "([^"]*)"$/,
        async (selectedLevel, projectedRent) => {
          const budgetApproved = 'true'; // As per GWT
          const expectedCompletionDate = calculateExpectedCompletionDate(TURNOVER_TARGET_READY_DATE, RENOVATION_LEAD_DAYS_GOOD);
          const decisionReason = `Selected ${selectedLevel} level due to ROI considerations.`;

          whenResponse = await request(app)
            .post('/api/v1/select-renovation-plan')
            .send({
              id: RENOVATION_CASE_ID,
              apartmentId: APARTMENT_ID,
              selectedLevel: selectedLevel,
              budgetApproved: budgetApproved,
              expectedCompletionDate: expectedCompletionDate,
              projectedRent: projectedRent,
              decisionReason: decisionReason,
              nextActorEmail: PROPERTY_MANAGER_EMAIL, // PropertyMgr performs this action
            });
        }
      );

      then('Renovation Plan Selected is recorded with the chosen level, budget and expected completion window', async () => {
        const expectedSelectedLevel = 'good';
        const expectedBudgetApproved = 'true';
        const expectedProjectedRent = '1600';
        const expectedCompletionDate = calculateExpectedCompletionDate(TURNOVER_TARGET_READY_DATE, RENOVATION_LEAD_DAYS_GOOD);
        const expectedDecisionReason = `Selected ${expectedSelectedLevel} level due to ROI considerations.`;


        expect(whenResponse.statusCode).toBe(200);
        expect(whenResponse.body.id).toBe(RENOVATION_CASE_ID);
        expect(whenResponse.body.apartmentId).toBe(APARTMENT_ID);
        expect(whenResponse.body.selectedLevel).toBe(expectedSelectedLevel);
        expect(whenResponse.body.budgetApproved).toBe(expectedBudgetApproved);
        expect(whenResponse.body.expectedCompletionDate).toBe(expectedCompletionDate);
        expect(whenResponse.body.projectedRent).toBe(expectedProjectedRent);
        expect(whenResponse.body.decisionReason).toBe(expectedDecisionReason);

        // Verify the state is persisted by fetching the RenovationCase
        const getRenovationCasesResponse = await request(app)
          .get('/api/v1/get-all-renovation-cases');
        expect(getRenovationCasesResponse.statusCode).toBe(200);
        const updatedRenovationCase = getRenovationCasesResponse.body.find(
          (rc) => rc.id === RENOVATION_CASE_ID
        );
        expect(updatedRenovationCase).toBeDefined();
        expect(updatedRenovationCase.selectedLevel).toBe(expectedSelectedLevel);
        expect(updatedRenovationCase.budgetApproved).toBe(expectedBudgetApproved);
        expect(updatedRenovationCase.expectedCompletionDate).toBe(expectedCompletionDate);
        expect(updatedRenovationCase.projectedRent).toBe(expectedProjectedRent);
        expect(updatedRenovationCase.decisionReason).toBe(expectedDecisionReason);
      });
    }
  );
});