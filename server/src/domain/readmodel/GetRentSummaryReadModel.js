import db from '../../infrastructure/db/index.js';
import { asOfDay, buildLedger, formatCents } from '../service/RentLedger.js';

class GetRentSummaryReadModel {
  // Rent outstanding and overdue across every property on asOf.
  static async query({ asOf } = {}) {
    const day = asOfDay(asOf);
    const { balances } = buildLedger(await db.findAll('RentCharge'), await db.findAll('RentPayment'), day);

    let outstandingCents = 0;
    let overdueCents = 0;
    let overdueLeasesCount = 0;

    for (const balance of balances.values()) {
      outstandingCents += balance.owedCents;
      overdueCents += balance.overdueCents;
      if (balance.overdueCents > 0) overdueLeasesCount += 1;
    }

    return {
      asOf: day,
      totalOutstanding: formatCents(outstandingCents),
      totalOverdue: formatCents(overdueCents),
      overdueLeasesCount,
    };
  }
}

export default GetRentSummaryReadModel;
