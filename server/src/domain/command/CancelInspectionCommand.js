import Inspection from '../entity/Inspection.js';
import db from '../../infrastructure/db/index.js';

class CancelInspectionCommand {
  static async execute({ id, reason }) {
    // GWT: "Given a scheduled inspection that is not completed or cancelled"
    const inspection = await db.findById('Inspection', id);
    if (!inspection) {
      throw new Error(`Inspection with ID ${id} not found.`);
    }

    const cancellationReason = String(reason ?? '').trim();

    if (!cancellationReason) {
      throw new Error('A reason is required to cancel an inspection.');
    }

    // An inspection is completed once Complete Inspection has recorded its completedAt.
    if (inspection.completedAt) {
      throw new Error(`Inspection with ID ${id} is already completed.`);
    }

    if (inspection.cancelledAt) {
      throw new Error(`Inspection with ID ${id} is already cancelled.`);
    }

    // GWT: "Then Inspection Cancelled is recorded with the reason."
    // The inspection is kept, so it stays in the list marked as cancelled.
    const updates = { cancelledAt: new Date().toISOString(), cancellationReason };
    await db.update('Inspection', id, updates);

    return new Inspection({ ...inspection, ...updates }).toJSON();
  }
}

export default CancelInspectionCommand;
