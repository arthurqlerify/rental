// Setup shared by the reschedule and cancel inspection scenarios: an active turnover, and
// inspections scheduled and completed for it.
import request from 'supertest';
import app from '../../src/bootstrap/app.js';

let turnoverCount = 0;

// Creates a property, an apartment, a lease and a turnover for that lease. The turnover has no
// ready-to-rent date, so it is active and can have an inspection scheduled.
export async function createActiveTurnover() {
  turnoverCount += 1;
  const propertyResponse = await request(app)
    .post('/api/v1/create-property')
    .send({
      name: `Inspection Test Property ${turnoverCount}`,
      address: `${turnoverCount} Inspection Street`,
      managerName: 'Pat Manager',
      managerEmail: 'pm@rentco.com',
      unitsCount: '10'
    });
  expect(propertyResponse.statusCode).toBe(200);
  const propertyId = propertyResponse.body.id;

  const apartmentResponse = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `IN-${turnoverCount}`, floorAreaSqm: '60', bedrooms: '2', status: 'Vacant' });
  expect(apartmentResponse.statusCode).toBe(200);
  const apartmentId = apartmentResponse.body.id;

  const leaseResponse = await request(app)
    .post('/api/v1/create-lease')
    .send({
      apartmentId,
      currentRent: '1500',
      startDate: '2025-01-01',
      endDate: '2025-09-30',
      nextActorEmail: 'pm@rentco.com',
      tenantName: 'Sam Lee'
    });
  expect(leaseResponse.statusCode).toBe(200);

  const turnoverResponse = await request(app)
    .post('/api/v1/create-turnover')
    .send({
      leaseId: leaseResponse.body.id,
      apartmentId,
      targetReadyDate: '2025-10-15',
      propertyId,
      nextActorEmail: 'inspections@rentco.com'
    });
  expect(turnoverResponse.statusCode).toBe(200);

  return { turnoverId: turnoverResponse.body.id, apartmentId };
}

export async function scheduleInspection({
  turnoverId,
  apartmentId,
  scheduledAt = '2025-09-28T09:00',
  assignedToEmail = 'inspector1@rentco.com'
}) {
  const response = await request(app)
    .post('/api/v1/schedule-inspection')
    .send({ turnoverId, apartmentId, scheduledAt, assignedToEmail, locationNotes: 'Keys at the front desk' });
  expect(response.statusCode).toBe(200);
  return response.body;
}

export async function completeInspection(inspection) {
  const response = await request(app)
    .post('/api/v1/complete-inspection')
    .send({
      id: inspection.id,
      turnoverId: inspection.turnoverId,
      apartmentId: inspection.apartmentId,
      completedAt: '2025-09-28T10:15',
      findingsSummary: 'No issues found',
      hasDamages: 'false'
    });
  expect(response.statusCode).toBe(200);
  expect(response.body.completedAt).toBe('2025-09-28T10:15');
  return response.body;
}

export async function getInspection(id) {
  const response = await request(app).get(`/api/v1/get-inspection-by-id/${id}`);
  expect(response.statusCode).toBe(200);
  return response.body;
}

export async function getTurnoverInspections(turnoverId) {
  const response = await request(app).get('/api/v1/get-all-inspections');
  expect(response.statusCode).toBe(200);
  return response.body.filter((i) => i.turnoverId === turnoverId);
}
