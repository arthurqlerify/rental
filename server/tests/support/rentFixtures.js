// Setup shared by the rent scenarios: a property, and a lease on a new vacant apartment in it.
import request from 'supertest';
import app from '../../src/bootstrap/app.js';
import { onDay } from './clock.js';

let propertyCount = 0;
let unitCount = 0;

export async function createProperty() {
  propertyCount += 1;
  const response = await request(app)
    .post('/api/v1/create-property')
    .send({
      name: `Rent Test Property ${propertyCount}`,
      address: `${propertyCount} Rent Street`,
      managerName: 'Pat Manager',
      managerEmail: 'pm@rentco.com',
      unitsCount: '10'
    });
  expect(response.statusCode).toBe(200);
  return response.body.id;
}

// Creates an active lease. Create Lease needs a start and an end date, so a lease given neither
// runs from 2025-01-01 to 2030-12-31, which covers every month these scenarios charge. With
// ended: true, the lease is also marked ended on its end date, with today set to that date.
export async function createLease({
  propertyId,
  tenantName,
  currentRent,
  startDate = '2025-01-01',
  endDate = '2030-12-31',
  ended = false
}) {
  unitCount += 1;
  const apartmentResponse = await request(app)
    .post('/api/v1/create-apartment')
    .send({
      propertyId,
      unitNumber: String(100 + unitCount),
      floorAreaSqm: '60',
      bedrooms: '2',
      status: 'Vacant'
    });
  expect(apartmentResponse.statusCode).toBe(200);

  const leaseResponse = await request(app)
    .post('/api/v1/create-lease')
    .send({
      apartmentId: apartmentResponse.body.id,
      currentRent,
      nextActorEmail: 'pm@rentco.com',
      tenantName,
      startDate,
      endDate
    });
  expect(leaseResponse.statusCode).toBe(200);
  const lease = leaseResponse.body;

  if (ended) {
    const endedResponse = await onDay(endDate, () =>
      request(app)
        .post('/api/v1/mark-lease-ended')
        .send({
          id: lease.id,
          apartmentId: lease.apartmentId,
          endDate,
          moveOutConfirmedAt: `${endDate}T10:00`,
          nextActorEmail: 'pm@rentco.com'
        })
    );
    expect(endedResponse.statusCode).toBe(200);
  }

  return { ...lease, endDate };
}
