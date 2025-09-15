import { v4 as uuidv4 } from 'uuid';

class Turnover {
  constructor({
    id = uuidv4(),
    leaseId,
    apartmentId,
    targetReadyDate,
    propertyId,
    nextActorEmail,
    vacatedAt,
    keysReturned,
    notes,
    readyToRentDate,
    listingReady,
    marketingEmail,
    finalInspectionPassedAt,
    openWorkOrdersCount,
    leaseEndDate,
    checklist
  }) {
    this.id = id;
    this.leaseId = leaseId;
    this.apartmentId = apartmentId;
    this.targetReadyDate = targetReadyDate;
    this.propertyId = propertyId;
    this.nextActorEmail = nextActorEmail;
    this.vacatedAt = vacatedAt;
    this.keysReturned = keysReturned;
    this.notes = notes;
    this.readyToRentDate = readyToRentDate;
    this.listingReady = listingReady;
    this.marketingEmail = marketingEmail;
    this.finalInspectionPassedAt = finalInspectionPassedAt;
    this.openWorkOrdersCount = openWorkOrdersCount;
    this.leaseEndDate = leaseEndDate;
    this.checklist = checklist;
  }

  toJSON() {
    return {
      id: this.id,
      leaseId: this.leaseId,
      apartmentId: this.apartmentId,
      targetReadyDate: this.targetReadyDate,
      propertyId: this.propertyId,
      nextActorEmail: this.nextActorEmail,
      vacatedAt: this.vacatedAt,
      keysReturned: this.keysReturned,
      notes: this.notes,
      readyToRentDate: this.readyToRentDate,
      listingReady: this.listingReady,
      marketingEmail: this.marketingEmail,
      finalInspectionPassedAt: this.finalInspectionPassedAt,
      openWorkOrdersCount: this.openWorkOrdersCount,
      leaseEndDate: this.leaseEndDate,
      checklist: this.checklist
    };
  }
}

export default Turnover;