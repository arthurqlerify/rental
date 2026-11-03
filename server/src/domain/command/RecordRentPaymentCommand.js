import { v4 as uuidv4 } from 'uuid';
import RentPayment from '../entity/RentPayment.js';
import db from '../../infrastructure/db/index.js';
import { PAYMENT_METHODS, isDay, amountToCents, toCents, fromCents, owedCents, byDueDate } from '../rent.js';

class RecordRentPaymentCommand {
  static async execute({ leaseId, amount, paidOn, method }) {
    // GIVEN: the lease exists
    const lease = await db.findById('Lease', leaseId);
    if (!lease) {
      throw new Error(`Lease with ID ${leaseId} not found.`);
    }

    const amountCents = amountToCents(amount);
    if (!(amountCents > 0)) {
      throw new Error('amount must be a positive number with at most two decimals.');
    }
    if (!isDay(paidOn)) {
      throw new Error('paidOn must be a date in the form YYYY-MM-DD.');
    }
    if (!PAYMENT_METHODS.includes(method)) {
      throw new Error(`Invalid method: ${method}. Must be one of ${PAYMENT_METHODS.join(', ')}.`);
    }

    // THEN: the payment pays the oldest unpaid charge first, in part if it does not cover it
    const unpaidCharges = (await db.findAll('RentCharge'))
      .filter((c) => c.leaseId === leaseId && owedCents(c) > 0)
      .sort(byDueDate);

    let leftCents = amountCents;
    const allocations = [];
    for (const charge of unpaidCharges) {
      if (leftCents === 0) break;
      const paidCents = Math.min(leftCents, owedCents(charge));
      await db.update('RentCharge', charge.id, { amountPaid: fromCents(toCents(charge.amountPaid) + paidCents) });
      allocations.push({ chargeId: charge.id, month: charge.month, amount: fromCents(paidCents) });
      leftCents -= paidCents;
    }

    // THEN: anything paid beyond what is owed is kept as credit for the next charge
    const payment = new RentPayment({
      id: uuidv4(),
      leaseId,
      propertyId: lease.propertyId,
      apartmentId: lease.apartmentId,
      tenantName: lease.tenantName,
      amount: fromCents(amountCents),
      paidOn,
      method,
      allocations,
      creditAmount: fromCents(leftCents),
      recordedAt: new Date().toISOString(),
    });

    await db.insert('RentPayment', payment.toJSON());

    return payment.toJSON();
  }
}

export default RecordRentPaymentCommand;
