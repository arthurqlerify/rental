import RentCharge from '../entity/RentCharge.js';
import db from '../../infrastructure/db/index.js';
import { isDay, today, toCents, fromCents, owedCents, overdueFrom, isOverdue } from '../rent.js';

const statusOf = (charge, asOf) => {
  if (charge.waivedAt) return 'Waived';
  if (owedCents(charge) === 0) return 'Paid';
  if (isOverdue(charge, asOf)) return 'Overdue';
  return toCents(charge.amountPaid) > 0 ? 'Part paid' : 'Unpaid';
};

class GetAllRentChargesReadModel {
  // asOf is the day overdue is judged on.
  static async query({ propertyId, leaseId, asOf = today() } = {}) {
    if (!isDay(asOf)) {
      throw new Error('asOf must be a date in the form YYYY-MM-DD.');
    }

    const charges = await db.findAll('RentCharge');

    return charges
      .filter((c) => (!propertyId || c.propertyId === propertyId) && (!leaseId || c.leaseId === leaseId))
      .map((c) => ({
        ...new RentCharge(c).toJSON(),
        owed: fromCents(owedCents(c)),
        overdueFrom: overdueFrom(c),
        isOverdue: isOverdue(c, asOf),
        status: statusOf(c, asOf),
      }))
      // Overdue charges first, then the newest
      .sort((a, b) => Number(b.isOverdue) - Number(a.isOverdue) || b.dueDate.localeCompare(a.dueDate));
  }
}

export default GetAllRentChargesReadModel;
