import ChargeRentCommand from './ChargeRentCommand.js';
import db from '../../infrastructure/db/index.js';
import { isValidMonth, rentForMonth } from '../service/RentLedger.js';

class IssueMonthlyRentChargesCommand {
  static async execute({ month }) {
    if (!isValidMonth(month)) {
      throw new Error('Month must be given as YYYY-MM.');
    }

    // GIVEN: the leases that run during the month
    const leases = await db.findAll('Lease');
    const existingCharges = await db.findAll('RentCharge');
    const activeLeases = leases.filter((lease) => rentForMonth(lease, month));

    if (!activeLeases.length) {
      throw new Error(`There are no active leases to charge for ${month}.`);
    }

    // WHEN: the PropertyMgr issues the month's charges
    // THEN: each active lease not yet charged for the month gets its charge
    const charged = [];
    const skipped = [];

    for (const lease of activeLeases) {
      try {
        const charge = ChargeRentCommand.chargeFor(lease, month, existingCharges);
        await db.insert('RentCharge', charge.toJSON());
        charged.push(charge.toJSON());
      } catch (err) {
        skipped.push({ leaseId: lease.id, tenantName: lease.tenantName, reason: err.message });
      }
    }

    if (!charged.length) {
      const alreadyCharged = activeLeases.every((lease) =>
        existingCharges.some((charge) => charge.leaseId === lease.id && charge.month === month)
      );
      throw new Error(
        alreadyCharged
          ? `Rent for ${month} has already been charged for every active lease.`
          : `No rent was charged for ${month}. ${skipped.map((s) => s.reason).join(' ')}`
      );
    }

    return { month, charged, skipped };
  }
}

export default IssueMonthlyRentChargesCommand;
