import Inspection from '../entity/Inspection.js';
import db from '../../infrastructure/db/index.js';

// An inspection can be moved to another time at most this many times. Giving it to another
// inspector is not a move, so it stays possible after the last move.
export const MAX_INSPECTION_MOVES = 3;

class RescheduleInspectionCommand {
  static async execute({ id, scheduledAt, assignedToEmail }) {
    // GWT: "Given a scheduled inspection that is not completed or cancelled"
    const inspection = await db.findById('Inspection', id);
    if (!inspection) {
      throw new Error(`Inspection with ID ${id} not found.`);
    }

    // An inspection is completed once Complete Inspection has recorded its completedAt.
    if (inspection.completedAt) {
      throw new Error(`Inspection with ID ${id} is already completed.`);
    }

    if (inspection.cancelledAt) {
      throw new Error(`Inspection with ID ${id} is cancelled.`);
    }

    // Only what is given changes: a new time, a new inspector, or both.
    const updates = {};
    if (scheduledAt) updates.scheduledAt = scheduledAt;
    // A move keeps the time the inspection had until now, so the list can show where it was moved from,
    // and counts towards the moves the inspection is allowed. An inspection never moved has no moveCount.
    if (scheduledAt && scheduledAt !== inspection.scheduledAt) {
      const moveCount = inspection.moveCount || 0;
      if (moveCount >= MAX_INSPECTION_MOVES) {
        throw new Error(
          `Inspection with ID ${id} was already moved ${MAX_INSPECTION_MOVES} times and cannot be moved again.`
        );
      }
      updates.previousScheduledAt = inspection.scheduledAt;
      updates.moveCount = moveCount + 1;
    }
    if (assignedToEmail) updates.assignedToEmail = assignedToEmail;

    if (Object.keys(updates).length === 0) {
      throw new Error('A new scheduledAt or assignedToEmail is required to reschedule an inspection.');
    }

    // GWT: "Then Inspection Rescheduled is recorded with the new time and inspector."
    await db.update('Inspection', id, updates);

    return new Inspection({ ...inspection, ...updates }).toJSON();
  }
}

export default RescheduleInspectionCommand;
