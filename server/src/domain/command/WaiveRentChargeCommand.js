import RentCharge from '../entity/RentCharge.js';
import db from '../../infrastructure/db/index.js';
import { buildLedger } from '../service/RentLedger.js';

class WaiveRentChargeCommand {
  static async execute({ id, reason }) {
    // GIVEN: a rent charge that is not waived and not fully paid
    const charge = await db.findById('RentCharge', id);

    if (!charge) {
      throw new Error(`Rent charge with ID ${id} not found.`);
    }

    const waiverReason = String(reason ?? '').trim();

    if (!waiverReason) {
      throw new Error('A reason is required to waive a rent charge.');
    }

    if (charge.waivedAt) {
      throw new Error('This rent charge has already been waived.');
    }

    const leaseCharges = (await db.findAll('RentCharge')).filter((c) => c.leaseId === charge.leaseId);
    const leasePayments = (await db.findAll('RentPayment')).filter((p) => p.leaseId === charge.leaseId);
    const entry = buildLedger(leaseCharges, leasePayments).entries.find((e) => e.id === id);

    if (entry && entry.status === 'Paid') {
      throw new Error('This rent charge is already paid, so there is nothing to waive.');
    }

    // THEN: Rent Charge Waived is recorded with the reason, and nothing is owed for the charge.
    // Anything already paid towards it goes to the next unpaid charge, or is kept as credit.
    const updates = { waivedAt: new Date().toISOString(), waiverReason };
    await db.update('RentCharge', id, updates);

    return new RentCharge({ ...charge, ...updates }).toJSON();
  }
}

export default WaiveRentChargeCommand;
