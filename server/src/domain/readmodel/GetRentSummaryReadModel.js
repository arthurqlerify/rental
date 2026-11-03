import GetAllLeaseBalancesReadModel from './GetAllLeaseBalancesReadModel.js';
import { today, toCents, fromCents, sumCents } from '../rent.js';

class GetRentSummaryReadModel {
  // asOf is the day overdue is judged on.
  static async query({ asOf = today() } = {}) {
    const balances = await GetAllLeaseBalancesReadModel.query({ asOf });
    const overdueLeases = balances.filter((b) => b.isOverdue);

    return {
      asOf,
      totalOutstanding: fromCents(sumCents(balances, (b) => toCents(b.owed))),
      totalOverdue: fromCents(sumCents(overdueLeases, (b) => toCents(b.overdue))),
      overdueLeaseCount: overdueLeases.length,
    };
  }
}

export default GetRentSummaryReadModel;
