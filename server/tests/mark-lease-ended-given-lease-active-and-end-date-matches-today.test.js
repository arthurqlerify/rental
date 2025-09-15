import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'mark-lease-ended-given-lease-active-and-end-date-matches-today.feature'));

const CURRENT_DATE_FULL = '2025-09-15T16:49:44.353Z';
const LEASE_END_DATE_SHORT = '2025-09-15'; // To match current date (today) for scenario

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let leaseId;
  let turnoverId;
  let initialTurnoverVacatedAt;
  let initialTurnoverKeysReturned;
  let markLeaseEndedResponse;

  test(
    'Given today matches the scheduled lease end date and the lease is still active, When Automation marks the lease as ended, Then Lease Ended is recorded and the associated turnover moves to awaiting vacancy confirmation.',
    ({ given, when, then }) => {
      given('today matches the scheduled lease end date and the lease is still active', async () => {
        // 1. Create Property
        const propertyRes = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: `Test Property ${Date.now()}`,
            address: '123 Test St',
            managerName: 'Test Manager',
            managerEmail: 'test@example.com',
            unitsCount: '1'
          });
        expect(propertyRes.statusCode).toBe(200);
        propertyId = propertyRes.body.id;

        // 2. Create Apartment
        const apartmentRes = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: propertyId,
            unitNumber: `Apt-${Date.now()}`,
            floorAreaSqm: '60',
            bedrooms: '2',
            status: 'Occupied'
          });
        expect(apartmentRes.statusCode).toBe(200);
        apartmentId = apartmentRes.body.id;

        // 3. Schedule Lease End (this implicitly creates the Lease and its associated Turnover)
        // The Lease schema requires 'turnoverId', so the system should generate/link one upon lease creation.
        const leaseCreationRes = await request(app)
          .post('/api/v1/schedule-lease-end')
          .send({
            apartmentId: apartmentId,
            endDate: LEASE_END_DATE_SHORT, // Lease ends today
            noticeDate: '2025-08-15',
            currentRent: '1500',
            nextActorEmail: 'ops@rentco.com'
          });
        expect(leaseCreationRes.statusCode).toBe(200);
        leaseId = leaseCreationRes.body.id;
        turnoverId = leaseCreationRes.body.turnoverId; // Capture the turnoverId implicitly created/linked by the system
        expect(leaseCreationRes.body.moveOutConfirmedAt).toBeUndefined(); // Lease is active, so moveOutConfirmedAt should not be set yet.

        // 4. Retrieve the associated Turnover to capture its initial state
        // Since there's no get-by-id for Turnover, we retrieve all and find the one.
        const getAllTurnoversRes = await request(app).get('/api/v1/get-all-turnovers');
        expect(getAllTurnoversRes.statusCode).toBe(200);
        const initialTurnover = getAllTurnoversRes.body.find(t => t.id === turnoverId);
        expect(initialTurnover).toBeDefined();

        initialTurnoverVacatedAt = initialTurnover.vacatedAt;
        initialTurnoverKeysReturned = initialTurnover.keysReturned;

        // 5. Final check that the lease is indeed active and end date matches
        const getLeaseRes = await request(app).get(`/api/v1/get-lease-by-id/${leaseId}`);
        expect(getLeaseRes.statusCode).toBe(200);
        expect(getLeaseRes.body.id).toBe(leaseId);
        expect(getLeaseRes.body.endDate).toBe(LEASE_END_DATE_SHORT);
        expect(getLeaseRes.body.moveOutConfirmedAt).toBeUndefined(); // Still active before marking ended
      });

      when('Automation marks the lease as ended', async () => {
        markLeaseEndedResponse = await request(app)
          .post('/api/v1/mark-lease-ended')
          .send({
            id: leaseId,
            apartmentId: apartmentId,
            endDate: LEASE_END_DATE_SHORT,
            moveOutConfirmedAt: CURRENT_DATE_FULL, // Set to current date as per scenario
            turnoverId: turnoverId,
            nextActorEmail: 'ops@rentco.com'
          });
      });

      then('Lease Ended is recorded and the associated turnover moves to awaiting vacancy confirmation.', async () => {
        // 1. Assert Mark Lease Ended command was successful and lease fields updated in response
        expect(markLeaseEndedResponse.statusCode).toBe(200);
        expect(markLeaseEndedResponse.body.id).toBe(leaseId);
        expect(markLeaseEndedResponse.body.moveOutConfirmedAt).toBe(CURRENT_DATE_FULL);

        // 2. Verify the Lease state by querying it directly
        const getLeaseAfterMarkedRes = await request(app).get(`/api/v1/get-lease-by-id/${leaseId}`);
        expect(getLeaseAfterMarkedRes.statusCode).toBe(200);
        expect(getLeaseAfterMarkedRes.body.id).toBe(leaseId);
        expect(getLeaseAfterMarkedRes.body.moveOutConfirmedAt).toBe(CURRENT_DATE_FULL);

        // 3. Verify the Turnover state. Query all turnovers to find the associated one.
        const getAllTurnoversAfterMarkedRes = await request(app).get('/api/v1/get-all-turnovers');
        expect(getAllTurnoversAfterMarkedRes.statusCode).toBe(200);
        const associatedTurnoverAfterMarked = getAllTurnoversAfterMarkedRes.body.find(t => t.id === turnoverId);
        expect(associatedTurnoverAfterMarked).toBeDefined();

        // "awaiting vacancy confirmation" is interpreted as vacatedAt and keysReturned
        // not having been updated by the MarkLeaseEnded command itself.
        // They should still reflect their initial state, waiting for RecordApartmentVacated.
        expect(associatedTurnoverAfterMarked.vacatedAt).toBe(initialTurnoverVacatedAt);
        expect(associatedTurnoverAfterMarked.keysReturned).toBe(initialTurnoverKeysReturned);
        // The nextActorEmail for the turnover should also remain unchanged, pointing to the next step (e.g., inspection/vacancy)
        expect(associatedTurnoverAfterMarked.nextActorEmail).toBe('inspections@rentco.com');
      });
    }
  );
});