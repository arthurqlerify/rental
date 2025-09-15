import { v4 as uuidv4 } from 'uuid';

class RenovationReport {
  constructor({
    id = uuidv4(),
    turnoverId,
    inspectionId,
    apartmentId,
    damageSeverity,
    estimatedRepairCost,
    damageSummary,
    nextActorEmail,
  }) {
    this.id = id;
    this.turnoverId = turnoverId;
    this.inspectionId = inspectionId;
    this.apartmentId = apartmentId;
    this.damageSeverity = damageSeverity;
    this.estimatedRepairCost = estimatedRepairCost;
    this.damageSummary = damageSummary;
    this.nextActorEmail = nextActorEmail;
  }

  update({
    turnoverId,
    inspectionId,
    apartmentId,
    damageSeverity,
    estimatedRepairCost,
    damageSummary,
    nextActorEmail,
  }) {
    if (turnoverId !== undefined) {
      this.turnoverId = turnoverId;
    }
    if (inspectionId !== undefined) {
      this.inspectionId = inspectionId;
    }
    if (apartmentId !== undefined) {
      this.apartmentId = apartmentId;
    }
    if (damageSeverity !== undefined) {
      this.damageSeverity = damageSeverity;
    }
    if (estimatedRepairCost !== undefined) {
      this.estimatedRepairCost = estimatedRepairCost;
    }
    if (damageSummary !== undefined) {
      this.damageSummary = damageSummary;
    }
    if (nextActorEmail !== undefined) {
      this.nextActorEmail = nextActorEmail;
    }
  }

  toJSON() {
    return {
      id: this.id,
      turnoverId: this.turnoverId,
      inspectionId: this.inspectionId,
      apartmentId: this.apartmentId,
      damageSeverity: this.damageSeverity,
      estimatedRepairCost: this.estimatedRepairCost,
      damageSummary: this.damageSummary,
      nextActorEmail: this.nextActorEmail,
    };
  }
}

export default RenovationReport;