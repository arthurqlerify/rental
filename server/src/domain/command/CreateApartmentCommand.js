import { v4 as uuidv4 } from 'uuid';
import Apartment from '../entity/Apartment.js';
import db from '../../infrastructure/db/index.js';

class CreateApartmentCommand {
  static async execute({ propertyId, unitNumber, floorAreaSqm, bedrooms, status }) {
    // GIVEN: the specified property exists
    const property = await db.findById('Property', propertyId);
    if (!property) {
      throw new Error(`Property with ID ${propertyId} does not exist.`);
    }

    // GIVEN: no apartment with the same unitNumber exists under that property
    const existingApartments = await db.findAll('Apartment');
    const duplicateApartment = existingApartments.find(
      (apt) => apt.propertyId === propertyId && apt.unitNumber === unitNumber
    );
    if (duplicateApartment) {
      throw new Error(`Apartment with unit number ${unitNumber} already exists under property ${propertyId}.`);
    }

    // GIVEN: floorAreaSqm and bedrooms are positive values
    const parsedFloorAreaSqm = parseFloat(floorAreaSqm);
    const parsedBedrooms = parseInt(bedrooms, 10);

    if (isNaN(parsedFloorAreaSqm) || parsedFloorAreaSqm <= 0) {
      throw new Error('floorAreaSqm must be a positive number.');
    }
    if (isNaN(parsedBedrooms) || parsedBedrooms <= 0) {
      throw new Error('bedrooms must be a positive integer.');
    }

    // GIVEN: a valid initial status (Occupied, Vacant or Ready)
    const validStatuses = ['Occupied', 'Vacant', 'Ready'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}.`);
    }

    // WHEN: the PropertyMgr submits Create Apartment
    const apartment = new Apartment({
      id: uuidv4(),
      propertyId,
      unitNumber,
      floorAreaSqm: floorAreaSqm.toString(), // Ensure it's stored as string as per OpenAPI
      bedrooms: bedrooms.toString(),         // Ensure it's stored as string as per OpenAPI
      status,
    });

    // THEN: Apartment Created is recorded
    await db.insert('Apartment', apartment.toJSON());

    return apartment.toJSON();
  }
}

export default CreateApartmentCommand;