import RentCharge from '../entity/RentCharge.js';
import RentPayment from '../entity/RentPayment.js';
import db from '../../infrastructure/db/index.js';
import { asOfDay, buildLedger } from '../service/RentLedger.js';

class GetAllRentChargesReadModel {
  // Every charge with what has been paid towards it, what is outstanding and whether it is
  // overdue on asOf. Overdue charges come first, then the newest month first.
  static async query({ propertyId, leaseId, asOf } = {}) {
    const day = asOfDay(asOf);
    const charges = (await db.findAll('RentCharge')).map((c) => new RentCharge(c).toJSON());
    const payments = (await db.findAll('RentPayment')).map((p) => new RentPayment(p).toJSON());

    return buildLedger(charges, payments, day)
      .entries.filter(
        (charge) =>
          (!propertyId || charge.propertyId === propertyId) && (!leaseId || charge.leaseId === leaseId)
      )
      .sort(
        (a, b) =>
          Number(b.overdue) - Number(a.overdue) ||
          String(b.month).localeCompare(String(a.month)) ||
          String(a.tenantName ?? '').localeCompare(String(b.tenantName ?? ''))
      );
  }
}

export default GetAllRentChargesReadModel;
