import Inspection from '../entity/Inspection.js';
import db from '../../infrastructure/db/index.js';

class CompleteInspectionCommand {
  static async execute({ id, turnoverId, apartmentId, completedAt, findingsSummary, hasDamages, photosUrl, nextActorEmail }) {
    // Given an inspection appointment exists for the turnover
    const existingInspection = await db.findById('Inspection', id);
    if (!existingInspection) {
      throw new Error(`Inspection with ID ${id} not found.`);
    }

    // When the Inspector records findings and marks the inspection complete
    const updates = {
      id,
      turnoverId,
      apartmentId,
      completedAt,
      findingsSummary,
      hasDamages,
      photosUrl,
      nextActorEmail,
    };

    // The `db.update` method will merge these updates with the existing inspection data.
    const updatedInspection = await db.update('Inspection', id, updates);

    if (!updatedInspection) {
      throw new Error(`Failed to update inspection with ID ${id}.`);
    }

    // Then Inspection Completed is recorded with a summary of results.
    return updatedInspection;
  }
}

export default CompleteInspectionCommand;