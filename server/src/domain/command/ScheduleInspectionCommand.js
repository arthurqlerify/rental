import { v4 as uuid } from 'uuid';
import Inspection from '../entity/Inspection.js';
import db from '../../infrastructure/db/index.js';

class ScheduleInspectionCommand {
  static async execute({ turnoverId, apartmentId, scheduledAt, assignedToEmail, locationNotes, nextActorEmail }) {
    // GWT: "Given an active turnover ..."
    const turnover = await db.findById('Turnover', turnoverId);
    if (!turnover) {
      throw new Error(`Turnover with ID ${turnoverId} not found.`);
    }

    // A turnover with a ready-to-rent date has been completed and is no longer active.
    if (turnover.readyToRentDate) {
      throw new Error(`Turnover with ID ${turnoverId} is already completed.`);
    }

    // A turnover has at most one open inspection: one that is neither completed nor cancelled.
    const openInspection = (await db.findAll('Inspection')).find(
      (i) => i.turnoverId === turnoverId && !i.completedAt && !i.cancelledAt
    );
    if (openInspection) {
      throw new Error(
        `Turnover with ID ${turnoverId} already has an open inspection (${openInspection.id}). Reschedule or cancel it instead.`
      );
    }

    // GWT: "Then Inspection Scheduled is recorded with the appointment details."
    const inspection = new Inspection({
      id: uuid(),
      turnoverId,
      apartmentId,
      scheduledAt,
      assignedToEmail,
      locationNotes,
      nextActorEmail,
    });

    await db.insert('Inspection', inspection.toJSON());
    return inspection.toJSON();
  }
}

export default ScheduleInspectionCommand;
