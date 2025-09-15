import { v4 as uuidv4 } from 'uuid';

class Apartment {
  constructor({
    id = uuidv4(),
    propertyId,
    unitNumber,
    floorAreaSqm,
    bedrooms,
    status,
  }) {
    // Following project conventions (e.g., Todo entity) for essential property validation
    if (!propertyId) throw new Error('Property ID is required');
    if (!unitNumber) throw new Error('Unit number is required');

    this.id = id;
    this.propertyId = propertyId;
    this.unitNumber = unitNumber;
    this.floorAreaSqm = floorAreaSqm;
    this.bedrooms = bedrooms;
    this.status = status;
  }

  toJSON() {
    return {
      id: this.id,
      propertyId: this.propertyId,
      unitNumber: this.unitNumber,
      floorAreaSqm: this.floorAreaSqm,
      bedrooms: this.bedrooms,
      status: this.status,
    };
  }

  /**
   * Updates the apartment's properties.
   * Only provided properties will be updated.
   * @param {object} updates - An object containing properties to update.
   * @param {string} [updates.propertyId]
   * @param {string} [updates.unitNumber]
   * @param {string} [updates.floorAreaSqm]
   * @param {string} [updates.bedrooms]
   * @param {string} [updates.status]
   */
  update({ propertyId, unitNumber, floorAreaSqm, bedrooms, status }) {
    if (propertyId !== undefined) this.propertyId = propertyId;
    if (unitNumber !== undefined) this.unitNumber = unitNumber;
    if (floorAreaSqm !== undefined) this.floorAreaSqm = floorAreaSqm;
    if (bedrooms !== undefined) this.bedrooms = bedrooms;
    if (status !== undefined) this.status = status;
  }
}

export default Apartment;