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
      recordedAt: this.recordedAt,
    };
  }
}

export default RentPayment;
