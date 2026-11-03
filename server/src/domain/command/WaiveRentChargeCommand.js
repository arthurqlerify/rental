import RentCharge from '../entity/RentCharge.js';
import db from '../../infrastructure/db/index.js';
import { fromCents, owedCents } from '../rent.js';

class WaiveRentChargeCommand {
  static async execute({ id, reason }) {
    // GIVEN: the charge exists and something is still owed on it
    const charge = await db.findById('RentCharge', id);
    if (!charge) {
      throw new Error(`Rent charge with ID ${id} not found.`);
    }
    if (typeof reason !== 'string' || !reason.trim()) {
      throw new Error('A reason is required to waive a rent charge.');
    }
    if (charge.waivedAt) {
      throw new Error('This rent charge has already been waived.');
    }
    const owed = owedCents(charge);
    if (owed === 0) {
      throw new Error('This rent charge is already paid, so there is nothing to waive.');
    }

    // THEN: the charge is waived with the reason and nothing more is owed for it
    const updates = {
      waivedAt: new Date().toISOString(),
      waivedReason: reason.trim(),
      waivedAmount: fromCents(owed),
    };
    await db.update('RentCharge', id, updates);

    return new RentCharge({ ...charge, ...updates }).toJSON();
  }
}

export default WaiveRentChargeCommand;
