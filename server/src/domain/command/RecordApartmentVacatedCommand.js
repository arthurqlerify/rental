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

    const updates = {
      vacatedAt,
      keysReturned,
      notes,
      nextActorEmail,
    };

    const updatedTurnover = await db.update('Turnover', id, updates);

    return updatedTurnover;
  }
}

export default RecordApartmentVacatedCommand;