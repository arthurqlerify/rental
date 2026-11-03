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
    periodStart,
    periodEnd,
    daysCharged,
    daysInMonth,
    monthlyRent,
    amount,
    amountPaid = 0,
    creditApplied = 0,
    issuedAt,
    waivedAt,
    waivedReason,
    waivedAmount,
  }) {
    this.id = id;
    this.leaseId = leaseId;
    this.propertyId = propertyId;
    this.apartmentId = apartmentId;
    this.tenantName = tenantName;
    this.month = month;
    this.dueDate = dueDate;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.daysCharged = daysCharged;
    this.daysInMonth = daysInMonth;
    this.monthlyRent = monthlyRent;
    this.amount = amount;
    this.amountPaid = amountPaid;
    this.creditApplied = creditApplied;
    this.issuedAt = issuedAt;
    this.waivedAt = waivedAt;
    this.waivedReason = waivedReason;
    this.waivedAmount = waivedAmount;
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
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      daysCharged: this.daysCharged,
      daysInMonth: this.daysInMonth,
      monthlyRent: this.monthlyRent,
      amount: this.amount,
      amountPaid: this.amountPaid,
      creditApplied: this.creditApplied,
      issuedAt: this.issuedAt,
      waivedAt: this.waivedAt,
      waivedReason: this.waivedReason,
      waivedAmount: this.waivedAmount,
    };
  }
}

export default RentCharge;
