import { v4 as uuidv4 } from 'uuid';
import RenovationReport from '../entity/RenovationReport.js';
import db from '../../infrastructure/db/index.js';

class CreateRenovationReportCommand {
  static async execute({ turnoverId, inspectionId, apartmentId, damageSeverity, estimatedRepairCost, damageSummary, nextActorEmail }) {
    // GWT: "Given an inspection has been completed and damages or issues were observed"
    const inspection = await db.findById('Inspection', inspectionId);
    if (!inspection) {
      throw new Error(`Inspection with ID ${inspectionId} not found.`);
    }

    // An inspection is completed once it has a completedAt.
    if (!inspection.completedAt) {
      throw new Error(`Inspection with ID ${inspectionId} is not completed.`);
    }

    // hasDamages is stored as the text 'true' or 'false'.
    if (String(inspection.hasDamages).toLowerCase() !== 'true') {
      throw new Error(`Inspection with ID ${inspectionId} found no damage.`);
    }

    const id = uuidv4();

    const renovationReport = new RenovationReport({
      id,
      turnoverId,
      inspectionId,
      apartmentId,
      damageSeverity,
      estimatedRepairCost,
      damageSummary,
      nextActorEmail,
    });

    await db.insert('Renovation Report', renovationReport.toJSON());

    return renovationReport.toJSON();
  }
}

export default CreateRenovationReportCommand;