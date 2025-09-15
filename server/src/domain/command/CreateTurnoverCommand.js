import { v4 as uuidv4 } from 'uuid';
import Turnover from '../entity/Turnover.js';
import db from '../../infrastructure/db/index.js';

class CreateTurnoverCommand {
  static async execute({ leaseId, apartmentId, targetReadyDate, propertyId, nextActorEmail }) {
    // Business Logic from GWT: "no turnover exists for that lease"
    const existingTurnovers = await db.findAll('Turnover');
    const turnoverExistsForLease = existingTurnovers.some(t => t.leaseId === leaseId);

    if (turnoverExistsForLease) {
      throw new Error(`Turnover already exists for leaseId: ${leaseId}`);
    }

    // "Turnover Created is recorded linking the lease, apartment and target dates."
    const id = uuidv4();
    const turnover = new Turnover({
      id,
      leaseId,
      apartmentId,
      targetReadyDate,
      propertyId,
      nextActorEmail,
    });

    await db.insert('Turnover', turnover.toJSON());
    return turnover.toJSON();
  }
}

export default CreateTurnoverCommand;