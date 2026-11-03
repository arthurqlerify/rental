import RentPayment from '../entity/RentPayment.js';
import db from '../../infrastructure/db/index.js';

class GetAllRentPaymentsReadModel {
  static async query({ propertyId, leaseId } = {}) {
    const payments = await db.findAll('RentPayment');

    return payments
      .filter((p) => (!propertyId || p.propertyId === propertyId) && (!leaseId || p.leaseId === leaseId))
      .map((p) => new RentPayment(p).toJSON())
      // Newest first
      .sort((a, b) => b.paidOn.localeCompare(a.paidOn) || String(b.recordedAt).localeCompare(String(a.recordedAt)));
  }
}

export default GetAllRentPaymentsReadModel;
