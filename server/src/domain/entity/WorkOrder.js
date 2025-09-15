import { v4 as uuidv4 } from 'uuid';

class WorkOrder {
  constructor({
    id = uuidv4(),
    renovationCaseId,
    turnoverId,
    apartmentId,
    scopeSummary,
    accessDetails,
    materialsList,
    nextActorEmail,
    startDate,
    endDate,
    crewName,
    assignedToEmail,
    materialsReady,
    actualStartDate,
    actualEndDate,
    completionNotes,
    photosUrl,
    varianceNotes,
  }) {
    this.id = id;
    this.renovationCaseId = renovationCaseId;
    this.turnoverId = turnoverId;
    this.apartmentId = apartmentId;
    this.scopeSummary = scopeSummary;
    this.accessDetails = accessDetails;
    this.materialsList = materialsList;
    this.nextActorEmail = nextActorEmail;
    this.startDate = startDate;
    this.endDate = endDate;
    this.crewName = crewName;
    this.assignedToEmail = assignedToEmail;
    this.materialsReady = materialsReady;
    this.actualStartDate = actualStartDate;
    this.actualEndDate = actualEndDate;
    this.completionNotes = completionNotes;
    this.photosUrl = photosUrl;
    this.varianceNotes = varianceNotes;
  }

  toJSON() {
    return {
      id: this.id,
      renovationCaseId: this.renovationCaseId,
      turnoverId: this.turnoverId,
      apartmentId: this.apartmentId,
      scopeSummary: this.scopeSummary,
      accessDetails: this.accessDetails,
      materialsList: this.materialsList,
      nextActorEmail: this.nextActorEmail,
      startDate: this.startDate,
      endDate: this.endDate,
      crewName: this.crewName,
      assignedToEmail: this.assignedToEmail,
      materialsReady: this.materialsReady,
      actualStartDate: this.actualStartDate,
      actualEndDate: this.actualEndDate,
      completionNotes: this.completionNotes,
      photosUrl: this.photosUrl,
      varianceNotes: this.varianceNotes,
    };
  }
}

export default WorkOrder;