import { v4 as uuidv4 } from 'uuid';

class RentCharge {
  constructor({
    id = uuidv4(),
    leaseId,
    propertyId,
    apartmentId,
    tenantName,
    month,
    dueDate,
    amount,
    daysCharged,
    daysInMonth,
    issuedAt,
    waivedAt,
    waiverReason,
  }) {
    this.id = id;
    this.leaseId = leaseId;
    this.propertyId = propertyId;
    this.apartmentId = apartmentId;
    this.tenantName = tenantName;
    this.month = month;
    this.dueDate = dueDate;
    this.amount = amount;
    this.daysCharged = daysCharged;
    this.daysInMonth = daysInMonth;
    this.issuedAt = issuedAt;
    this.waivedAt = waivedAt;
    this.waiverReason = waiverReason;
  }

  toJSON() {
    return {
      id: this.id,
      leaseId: this.leaseId,
      propertyId: this.propertyId,
      apartmentId: this.apartmentId,
      tenantName: this.tenantName,
      month: this.month,
      dueDate: this.dueDate,
      amount: this.amount,
      daysCharged: this.daysCharged,
      daysInMonth: this.daysInMonth,
      issuedAt: this.issuedAt,
      waivedAt: this.waivedAt,
      waiverReason: this.waiverReason,
    };
  }
}

export default RentCharge;
