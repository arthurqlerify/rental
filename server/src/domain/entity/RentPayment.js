import { v4 as uuidv4 } from 'uuid';

class RentPayment {
  constructor({
    id = uuidv4(),
    leaseId,
    propertyId,
    apartmentId,
    tenantName,
    amount,
    paidOn,
    method,
    allocations = [],
    creditAmount = 0,
    recordedAt,
  }) {
    this.id = id;
    this.leaseId = leaseId;
    this.propertyId = propertyId;
    this.apartmentId = apartmentId;
    this.tenantName = tenantName;
    this.amount = amount;
    this.paidOn = paidOn;
    this.method = method;
    this.allocations = allocations; // [{ chargeId, month, amount }] the charges this payment paid
    this.creditAmount = creditAmount; // What was left over and kept as credit
    this.recordedAt = recordedAt;
  }

  toJSON() {
    return {
      id: this.id,
      leaseId: this.leaseId,
      propertyId: this.propertyId,
      apartmentId: this.apartmentId,
      tenantName: this.tenantName,
      amount: this.amount,
      paidOn: this.paidOn,
      method: this.method,
      allocations: this.allocations,
      creditAmount: this.creditAmount,
      recordedAt: this.recordedAt,
    };
  }
}

export default RentPayment;
