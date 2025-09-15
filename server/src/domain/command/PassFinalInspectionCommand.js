import Inspection from '../entity/Inspection.js';
import db from '../../infrastructure/db/index.js';

class PassFinalInspectionCommand {
  static async execute({ id, passedAt, inspectorName, certificateUrl, nextActorEmail }) {
    // GWT: "Given ... a final inspection appointment exists"
    const existingInspectionData = await db.findById('Inspection', id);

    if (!existingInspectionData) {
      throw new Error(`Inspection with ID ${id} not found.`);
    }

    const inspection = new Inspection(existingInspectionData);

    // GWT: "When the Inspector verifies all items meet standards and no defects remain"
    // GWT: "Then Final Inspection Passed is recorded with inspector sign-off."
    // Update the inspection entity with the passed final inspection details
    inspection.passedAt = passedAt;
    inspection.inspectorName = inspectorName;
    inspection.certificateUrl = certificateUrl;
    inspection.nextActorEmail = nextActorEmail;

    // Persist the updated entity
    await db.update('Inspection', inspection.id, inspection.toJSON());

    return inspection.toJSON();
  }
}

export default PassFinalInspectionCommand;