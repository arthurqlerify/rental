import { v4 as uuidv4 } from 'uuid';
import Lease from '../entity/Lease.js';
import Apartment from '../entity/Apartment.js'; // Assuming this entity exists and has 'status' and 'propertyId' fields
import db from '../../infrastructure/db/index.js';

class CreateLeaseCommand {
  static async execute({ apartmentId, currentRent, nextActorEmail, tenantName }) {
    // GIVEN: a specific apartment is available for leasing (status is 'Vacant' or 'Ready')
    const apartment = await db.findById('Apartment', apartmentId);

    if (!apartment) {
      throw new Error(`Apartment with ID ${apartmentId} not found.`);
    }

    if (apartment.status !== 'Vacant' && apartment.status !== 'Ready') {
      throw new Error(`Apartment ${apartmentId} is not available for leasing. Current status: ${apartment.status}.`);
    }

    // WHEN: the PropertyMgr submits Create Lease
    const leaseId = uuidv4();
    const newLease = new Lease({
      id: leaseId,
      apartmentId,
      currentRent,
      nextActorEmail,
      tenantName,
      // propertyId needs to be extracted from the apartment as it's a field on Lease
      // Assuming Apartment entity has propertyId
      propertyId: apartment.propertyId,
      // Other Lease fields (e.g., endDate, noticeDate, moveOutConfirmedAt, turnoverId)
      // are not provided by this command's input as per OpenAPI specification,
      // nor is there GWT logic to derive them for this specific command.
    });

    // THEN: Lease Created is recorded with a new leaseId for the apartment and tenant
    await db.insert('Lease', newLease.toJSON());

    // THEN: the apartment's status changes to 'Occupied'.
    // Create a new Apartment instance with the updated status
    const updatedApartment = new Apartment({ ...apartment, status: 'Occupied' });
    await db.update('Apartment', apartmentId, updatedApartment.toJSON());

    return newLease.toJSON();
  }
}

export default CreateLeaseCommand;