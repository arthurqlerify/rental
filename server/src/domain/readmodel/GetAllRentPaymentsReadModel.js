import RentPayment from '../entity/RentPayment.js';
import db from '../../infrastructure/db/index.js';

class GetAllRentPaymentsReadModel {
  // Every payment, the most recently paid first.
  static async query({ propertyId, leaseId } = {}) {
    return (await db.findAll('RentPayment'))
      .map((p) => new RentPayment(p).toJSON())
      .filter(
        (payment) =>
          (!propertyId || payment.propertyId === propertyId) && (!leaseId || payment.leaseId === leaseId)
      )
      .sort(
        (a, b) =>
          String(b.paidOn).localeCompare(String(a.paidOn)) ||
          String(b.recordedAt ?? '').localeCompare(String(a.recordedAt ?? ''))
      );
  }
}

export default GetAllRentPaymentsReadModel;
