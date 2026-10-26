import Apartment from '../entity/Apartment.js';
import db from '../../infrastructure/db/index.js';

class RecordApartmentVacatedCommand {
  static async execute({ id, apartmentId, vacatedAt, keysReturned, notes, nextActorEmail }) {
    const existingTurnover = await db.findById('Turnover', id);

    if (!existingTurnover) {
      throw new Error(`Turnover with ID ${id} not found.`);
    }

    if (existingTurnover.apartmentId !== apartmentId) {
      throw new Error(`Turnover ID ${id} is not associated with apartment ID ${apartmentId}.`);
    }

    // GIVEN: the tenant has returned keys
    if (String(keysReturned).toLowerCase() !== 'true') {
      throw new Error('The apartment cannot be recorded as vacated until the tenant has returned the keys.');
    }

    const apartment = await db.findById('Apartment', apartmentId);

    if (!apartment) {
      throw new Error(`Apartment with ID ${apartmentId} not found.`);
    }

    const updates = {
      vacatedAt,
      keysReturned,
      notes,
      nextActorEmail,
    };

    const updatedTurnover = await db.update('Turnover', id, updates);

    // THEN: the apartment's status changes to 'Vacant'
    const updatedApartment = new Apartment({ ...apartment, status: 'Vacant' });
    await db.update('Apartment', apartmentId, updatedApartment.toJSON());

    return updatedTurnover;
  }
}

export default RecordApartmentVacatedCommand;