import { v4 as uuidv4 } from 'uuid';
import RentCharge from '../entity/RentCharge.js';
import db from '../../infrastructure/db/index.js';
import { isDay, isMonth, daysFromTo, lastDayOfMonth, amountToCents, fromCents, creditCents } from '../rent.js';

const ALREADY_CHARGED = 'Rent for this month has already been charged.';
const NO_VALID_RENT = 'The lease has no valid current rent.';

// A lease date as 'YYYY-MM-DD', or undefined when the lease has none.
const leaseDay = (value) => {
  const day = typeof value === 'string' ? value.slice(0, 10) : undefined;
  return isDay(day) ? day : undefined;
};

class IssueRentChargesCommand {
  static async execute({ month }) {
    if (!isMonth(month)) {
      throw new Error('month must be in the form YYYY-MM.');
    }

    const monthStart = `${month}-01`;
    const monthEnd = lastDayOfMonth(month);
    const daysInMonth = daysFromTo(monthStart, monthEnd);

    const [leases, charges, payments] = await Promise.all([
      db.findAll('Lease'),
      db.findAll('RentCharge'),
      db.findAll('RentPayment'),
    ]);

    const issued = [];
    const refused = [];

    for (const lease of leases) {
      // GIVEN: the lease runs on at least one day of the month
      const startDate = leaseDay(lease.startDate);
      const endDate = leaseDay(lease.endDate) || leaseDay(lease.moveOutConfirmedAt);
      const periodStart = startDate && startDate > monthStart ? startDate : monthStart;
      const periodEnd = endDate && endDate < monthEnd ? endDate : monthEnd;
      if (periodStart > periodEnd) continue;

      const leaseCharges = charges.filter((c) => c.leaseId === lease.id);
      const refuse = (reason) => refused.push({ leaseId: lease.id, tenantName: lease.tenantName, reason });

      // GIVEN: the lease has not been charged for this month yet
      if (leaseCharges.some((c) => c.month === month)) {
        refuse(ALREADY_CHARGED);
        continue;
      }

      const monthlyRentCents = amountToCents(lease.currentRent);
      if (!(monthlyRentCents > 0)) {
        refuse(NO_VALID_RENT);
        continue;
      }

      // THEN: one charge due on the 1st for the lease's current rent, for the days the lease runs
      const daysCharged = daysFromTo(periodStart, periodEnd);
      const amountCents = Math.round((monthlyRentCents * daysCharged) / daysInMonth);

      // Credit left over from earlier payments goes to the new charge.
      const leasePayments = payments.filter((p) => p.leaseId === lease.id);
      const creditAppliedCents = Math.min(creditCents(leaseCharges, leasePayments), amountCents);

      const charge = new RentCharge({
        id: uuidv4(),
        leaseId: lease.id,
        propertyId: lease.propertyId,
        apartmentId: lease.apartmentId,
        tenantName: lease.tenantName,
        month,
        dueDate: monthStart,
        periodStart,
        periodEnd,
        daysCharged,
        daysInMonth,
        monthlyRent: fromCents(monthlyRentCents),
        amount: fromCents(amountCents),
        amountPaid: fromCents(creditAppliedCents),
        creditApplied: fromCents(creditAppliedCents),
        issuedAt: new Date().toISOString(),
      });

      await db.insert('RentCharge', charge.toJSON());
      issued.push(charge.toJSON());
    }

    if (issued.length === 0) {
      if (refused.length === 0) {
        throw new Error(`No lease is active in ${month}, so there is no rent to charge.`);
      }
      if (refused.every((r) => r.reason === ALREADY_CHARGED)) {
        throw new Error(`Rent for ${month} has already been charged for every active lease.`);
      }
      throw new Error(`No rent was charged for ${month}: every active lease is already charged or has no valid current rent.`);
    }

    return { month, issued, refused };
  }
}

export default IssueRentChargesCommand;
