import { v4 as uuidv4 } from 'uuid';

class Lease {
  constructor({
    id = uuidv4(),
    apartmentId,
    startDate,
    endDate,
    noticeDate,
    currentRent,
    propertyId,
    nextActorEmail,
    moveOutConfirmedAt,
    turnoverId,
    tenantName,
  }) {
    this.id = id;
    this.apartmentId = apartmentId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.noticeDate = noticeDate;
    this.currentRent = currentRent;
    this.propertyId = propertyId;
    this.nextActorEmail = nextActorEmail;
    this.moveOutConfirmedAt = moveOutConfirmedAt;
    this.turnoverId = turnoverId;
    this.tenantName = tenantName;
  }

  toJSON() {
    return {
      id: this.id,
      apartmentId: this.apartmentId,
      startDate: this.startDate,
      endDate: this.endDate,
      noticeDate: this.noticeDate,
      currentRent: this.currentRent,
      propertyId: this.propertyId,
      nextActorEmail: this.nextActorEmail,
      moveOutConfirmedAt: this.moveOutConfirmedAt,
      turnoverId: this.turnoverId,
      tenantName: this.tenantName,
    };
  }
}

export default Lease;