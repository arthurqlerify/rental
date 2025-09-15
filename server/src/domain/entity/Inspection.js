import { v4 as uuidv4 } from 'uuid';

class Inspection {
  constructor({
    id = uuidv4(), // Use uuidv4 for generating IDs in the constructor for new entities, per rule
    turnoverId,
    apartmentId,
    scheduledAt,
    assignedToEmail,
    inspectorName,
    locationNotes,
    nextActorEmail,
    completedAt,
    findingsSummary,
    hasDamages,
    photosUrl,
    passedAt,
    certificateUrl,
    checklist
  }) {
    if (!id) {
      throw new Error('Inspection ID is required.');
    }

    this.id = id;
    this.turnoverId = turnoverId;
    this.apartmentId = apartmentId;
    this.scheduledAt = scheduledAt;
    this.assignedToEmail = assignedToEmail;
    this.inspectorName = inspectorName;
    this.locationNotes = locationNotes;
    this.nextActorEmail = nextActorEmail;
    this.completedAt = completedAt;
    this.findingsSummary = findingsSummary;
    this.hasDamages = hasDamages;
    this.photosUrl = photosUrl;
    this.passedAt = passedAt;
    this.certificateUrl = certificateUrl;
    this.checklist = checklist;
  }

  toJSON() {
    return {
      id: this.id,
      turnoverId: this.turnoverId,
      apartmentId: this.apartmentId,
      scheduledAt: this.scheduledAt,
      assignedToEmail: this.assignedToEmail,
      inspectorName: this.inspectorName,
      locationNotes: this.locationNotes,
      nextActorEmail: this.nextActorEmail,
      completedAt: this.completedAt,
      findingsSummary: this.findingsSummary,
      hasDamages: this.hasDamages,
      photosUrl: this.photosUrl,
      passedAt: this.passedAt,
      certificateUrl: this.certificateUrl,
      checklist: this.checklist
    };
  }
}

export default Inspection;