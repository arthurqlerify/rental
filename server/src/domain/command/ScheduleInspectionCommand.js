import { v4 as uuid } from 'uuid';
import Inspection from '../entity/Inspection.js';
import db from '../../infrastructure/db/index.js';

class ScheduleInspectionCommand {
  static async execute({ turnoverId, apartmentId, scheduledAt, assignedToEmail, locationNotes, nextActorEmail }) {
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