import { v4 as uuidv4 } from 'uuid';

class Apartment {
  constructor({
    id = uuidv4(),
    propertyId,
    unitNumber,
    floorAreaSqm,
    bedrooms,
    status,
    emptySince,
    note,
    noteUpdatedAt,
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
    // When the apartment last became empty (Vacant or Ready); null while it has a tenant.
    this.emptySince = emptySince;
    // What the next person should know about the apartment, and when it was last saved; null once cleared.
    this.note = note;
    this.noteUpdatedAt = noteUpdatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      propertyId: this.propertyId,
      unitNumber: this.unitNumber,
      floorAreaSqm: this.floorAreaSqm,
      bedrooms: this.bedrooms,
      status: this.status,
      emptySince: this.emptySince,
      note: this.note,
      noteUpdatedAt: this.noteUpdatedAt,
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
   * @param {string|null} [updates.emptySince]
   * @param {string|null} [updates.note]
   * @param {string|null} [updates.noteUpdatedAt]
   */
  update({ propertyId, unitNumber, floorAreaSqm, bedrooms, status, emptySince, note, noteUpdatedAt }) {
    if (propertyId !== undefined) this.propertyId = propertyId;
    if (unitNumber !== undefined) this.unitNumber = unitNumber;
    if (floorAreaSqm !== undefined) this.floorAreaSqm = floorAreaSqm;
    if (bedrooms !== undefined) this.bedrooms = bedrooms;
    if (status !== undefined) this.status = status;
    if (emptySince !== undefined) this.emptySince = emptySince;
    if (note !== undefined) this.note = note;
    if (noteUpdatedAt !== undefined) this.noteUpdatedAt = noteUpdatedAt;
  }
}

export default Apartment;