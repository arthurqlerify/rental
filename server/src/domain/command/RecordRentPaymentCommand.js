import RentPayment from '../entity/RentPayment.js';
import db from '../../infrastructure/db/index.js';
import { formatCents, isValidDate, PAYMENT_METHODS, toCents } from '../service/RentLedger.js';

class RecordRentPaymentCommand {
  static async execute({ leaseId, amount, paidOn, method }) {
    // GIVEN: the lease exists
    const lease = await db.findById('Lease', leaseId);

    if (!lease) {
      throw new Error(`Lease with ID ${leaseId} not found.`);
    }

    const amountCents = toCents(amount);

    if (!(amountCents > 0)) {
      throw new Error('Amount must be more than 0, with at most two decimals.');
    }

    if (!isValidDate(paidOn)) {
      throw new Error('Date paid must be a date in the form YYYY-MM-DD.');
    }

    if (!PAYMENT_METHODS.includes(method)) {
      throw new Error(`Method must be one of: ${PAYMENT_METHODS.join(', ')}.`);
    }

    // THEN: Rent Payment Recorded. Part payments are allowed; the read models apply it to the
    // oldest unpaid charge first and keep what is left over as credit.
    const payment = new RentPayment({
      leaseId,
      propertyId: lease.propertyId,
      apartmentId: lease.apartmentId,
      tenantName: lease.tenantName,
      amount: formatCents(amountCents),
      paidOn,
      method,
      recordedAt: new Date().toISOString(),
    });

    await db.insert('RentPayment', payment.toJSON());

    return payment.toJSON();
  }
}

export default RecordRentPaymentCommand;
