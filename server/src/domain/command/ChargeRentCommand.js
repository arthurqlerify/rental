import RentCharge from '../entity/RentCharge.js';
import db from '../../infrastructure/db/index.js';
import { formatCents, isValidMonth, rentForMonth } from '../service/RentLedger.js';

class ChargeRentCommand {
  static async execute({ leaseId, month }) {
    if (!isValidMonth(month)) {
      throw new Error('Month must be given as YYYY-MM.');
    }

    // GIVEN: an active lease that has not been charged for the month
    const lease = await db.findById('Lease', leaseId);

    if (!lease) {
      throw new Error(`Lease with ID ${leaseId} not found.`);
    }

    const existingCharges = await db.findAll('RentCharge');
    const charge = ChargeRentCommand.chargeFor(lease, month, existingCharges);

    // THEN: Rent Charged is recorded, due on the 1st, for the lease's current rent
    await db.insert('RentCharge', charge.toJSON());

    return charge.toJSON();
  }

  // The month's charge for one lease. Throws when the lease cannot be charged for the month.
  static chargeFor(lease, month, existingCharges) {
    if (existingCharges.some((charge) => charge.leaseId === lease.id && charge.month === month)) {
      throw new Error(`Rent for ${month} has already been charged for lease ${lease.id}.`);
    }

    const rent = rentForMonth(lease, month);

    if (!rent) {
      throw new Error(`Lease ${lease.id} is not active in ${month}.`);
    }

    if (!(rent.amountCents > 0)) {
      throw new Error(`Lease ${lease.id} has no valid current rent to charge.`);
    }

    return new RentCharge({
      leaseId: lease.id,
      propertyId: lease.propertyId,
      apartmentId: lease.apartmentId,
      tenantName: lease.tenantName,
      month,
      dueDate: rent.dueDate,
      amount: formatCents(rent.amountCents),
      daysCharged: rent.daysCharged,
      daysInMonth: rent.daysInMonth,
      issuedAt: new Date().toISOString(),
    });
  }
}

export default ChargeRentCommand;
