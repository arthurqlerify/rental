import db from '../../infrastructure/db/index.js';
import { isDay, today, fromCents, owedCents, isOverdue, creditCents, sumCents } from '../rent.js';

const groupByLease = (items) => {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.leaseId)) groups.set(item.leaseId, []);
    groups.get(item.leaseId).push(item);
  }
  return groups;
};

class GetAllLeaseBalancesReadModel {
  // asOf is the day overdue is judged on.
  static async query({ propertyId, leaseId, asOf = today() } = {}) {
    if (!isDay(asOf)) {
      throw new Error('asOf must be a date in the form YYYY-MM-DD.');
    }

    const [leases, charges, payments] = await Promise.all([
      db.findAll('Lease'),
      db.findAll('RentCharge'),
      db.findAll('RentPayment'),
    ]);
    const chargesByLease = groupByLease(charges);
    const paymentsByLease = groupByLease(payments);

    return leases
      .filter((l) => (!propertyId || l.propertyId === propertyId) && (!leaseId || l.id === leaseId))
      .map((lease) => {
        const leaseCharges = chargesByLease.get(lease.id) || [];
        const overdueCharges = leaseCharges.filter((c) => isOverdue(c, asOf));
        return {
          leaseId: lease.id,
          tenantName: lease.tenantName,
          propertyId: lease.propertyId,
          apartmentId: lease.apartmentId,
          owed: fromCents(sumCents(leaseCharges, owedCents)),
          overdue: fromCents(sumCents(overdueCharges, owedCents)),
          credit: fromCents(creditCents(leaseCharges, paymentsByLease.get(lease.id) || [])),
          isOverdue: overdueCharges.length > 0,
        };
      })
      // Overdue leases first, the most overdue at the top
      .sort((a, b) => Number(b.isOverdue) - Number(a.isOverdue) || b.overdue - a.overdue || b.owed - a.owed);
  }
}

export default GetAllLeaseBalancesReadModel;
