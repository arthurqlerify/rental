import db from '../../infrastructure/db/index.js';
import { asOfDay, balanceStatus, buildLedger, formatCents } from '../service/RentLedger.js';

const NO_BALANCE = { owedCents: 0, overdueCents: 0, creditCents: 0 };

class GetAllLeaseBalancesReadModel {
  // Each lease's balance on asOf: what is owed, what of that is overdue, and any credit.
  // Overdue leases come first, the most overdue at the top.
  static async query({ propertyId, leaseId, asOf } = {}) {
    const day = asOfDay(asOf);
    const leases = await db.findAll('Lease');
    const { balances } = buildLedger(await db.findAll('RentCharge'), await db.findAll('RentPayment'), day);

    return leases
      .filter((lease) => (!propertyId || lease.propertyId === propertyId) && (!leaseId || lease.id === leaseId))
      .map((lease) => ({ lease, balance: balances.get(lease.id) ?? NO_BALANCE }))
      .sort(
        (a, b) =>
          b.balance.overdueCents - a.balance.overdueCents ||
          b.balance.owedCents - a.balance.owedCents ||
          String(a.lease.tenantName ?? '').localeCompare(String(b.lease.tenantName ?? ''))
      )
      .map(({ lease, balance }) => ({
        leaseId: lease.id,
        tenantName: lease.tenantName,
        propertyId: lease.propertyId,
        apartmentId: lease.apartmentId,
        owed: formatCents(balance.owedCents),
        overdue: formatCents(balance.overdueCents),
        credit: formatCents(balance.creditCents),
        status: balanceStatus(balance),
      }));
  }
}

export default GetAllLeaseBalancesReadModel;
