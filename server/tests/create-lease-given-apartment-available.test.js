import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-lease-given-apartment-available.feature'));

defineFeature(feature, test => {
  let propertyId;
  let apartmentId;
  let createLeasePayload;
  let createLeaseResponse;
  let newLeaseId;

  const CURRENT_DATE = '2025-09-15T18:08:46.683Z'; // Use the provided current date

  test(
    "Given a specific apartment is available for leasing (status is 'Vacant' or 'Ready') and the PropertyMgr provides tenant details, lease start date, end date, and rent amount, When the PropertyMgr submits Create Lease, Then Lease Created is recorded with a new leaseId for the apartment and tenant, and the apartment's status changes to 'Occupied'.",
    ({ given, when, then }) => {
      given("a specific apartment is available for leasing (status is 'Vacant' or 'Ready') and the PropertyMgr provides tenant details, lease start date, end date, and rent amount", async () => {
        // 1. Create a Property
        const createPropertyResponse = await request(app)
          .post('/api/v1/create-property')
          .send({
            name: 'Test Property for Lease',
            address: '123 Main St',
            managerName: 'Jane Doe',
            managerEmail: 'jane.doe@example.com',
            unitsCount: '10'
          });

        expect(createPropertyResponse.statusCode).toBe(200);
        propertyId = createPropertyResponse.body.id;

        // 2. Create an Apartment with 'Vacant' status
        const createApartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send({
            propertyId: propertyId,
            unitNumber: '101',
            floorAreaSqm: '75',
            bedrooms: '2',
            status: 'Vacant'
          });

        expect(createApartmentResponse.statusCode).toBe(200);
        apartmentId = createApartmentResponse.body.id;

        // Prepare lease details from the PropertyMgr
        // Note: OpenAPI CreateLeaseRequest does not include lease start/end date directly,
        //       only currentRent, tenantName, nextActorEmail, and apartmentId.
        createLeasePayload = {
          apartmentId: apartmentId,
          currentRent: '1500', // Example rent amount
          nextActorEmail: 'pm@rentco.com',
          tenantName: 'John Tenant' // Example tenant details
        };
      });

      when('the PropertyMgr submits Create Lease', async () => {
        createLeaseResponse = await request(app)
          .post('/api/v1/create-lease')
          .send(createLeasePayload);
      });

      then("Lease Created is recorded with a new leaseId for the apartment and tenant, and the apartment's status changes to 'Occupied'.", async () => {
        // Assert Lease Creation
        expect(createLeaseResponse.statusCode).toBe(200);
        expect(createLeaseResponse.body).toHaveProperty('id');
        expect(typeof createLeaseResponse.body.id).toBe('string');
        newLeaseId = createLeaseResponse.body.id;

        expect(createLeaseResponse.body.apartmentId).toBe(createLeasePayload.apartmentId);
        expect(createLeaseResponse.body.currentRent).toBe(createLeasePayload.currentRent);
        expect(createLeaseResponse.body.tenantName).toBe(createLeasePayload.tenantName);
        expect(createLeaseResponse.body.nextActorEmail).toBe(createLeasePayload.nextActorEmail);

        // Verify that required Lease fields are present, even if not in CreateLeaseRequest
        expect(createLeaseResponse.body).toHaveProperty('endDate');
        expect(typeof createLeaseResponse.body.endDate).toBe('string');
        expect(createLeaseResponse.body).toHaveProperty('noticeDate');
        expect(typeof createLeaseResponse.body.noticeDate).toBe('string');
        expect(createLeaseResponse.body).toHaveProperty('propertyId');
        expect(typeof createLeaseResponse.body.propertyId).toBe('string');
        expect(createLeaseResponse.body.propertyId).toBe(propertyId); // propertyId should be derived from apartmentId
        expect(createLeaseResponse.body).toHaveProperty('moveOutConfirmedAt');
        // moveOutConfirmedAt might be null or an empty string initially if not set, 
        // but OpenAPI schema marks it required. We'll check for string type.
        expect(typeof createLeaseResponse.body.moveOutConfirmedAt).toBe('string');
        expect(createLeaseResponse.body).toHaveProperty('turnoverId');
        // turnoverId might be null or an empty string initially.
        expect(typeof createLeaseResponse.body.turnoverId).toBe('string');

        // Retrieve the created lease to confirm
        const getLeaseResponse = await request(app)
          .get(`/api/v1/get-lease-by-id/${newLeaseId}`);

        expect(getLeaseResponse.statusCode).toBe(200);
        expect(getLeaseResponse.body.id).toBe(newLeaseId);
        expect(getLeaseResponse.body.apartmentId).toBe(apartmentId);
        expect(getLeaseResponse.body.tenantName).toBe(createLeasePayload.tenantName);

        // Assert Apartment status change
        const getApartmentsResponse = await request(app)
          .get('/api/v1/get-all-apartments');

        expect(getApartmentsResponse.statusCode).toBe(200);
        const updatedApartment = getApartmentsResponse.body.find(
          apt => apt.id === apartmentId
        );

        expect(updatedApartment).toBeDefined();
        expect(updatedApartment.status).toBe('Occupied');
      });
    }
  );
});