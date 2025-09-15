import { v4 as uuidv4 } from 'uuid';
import RenovationCase from '../entity/RenovationCase.js';
import db from '../../infrastructure/db/index.js';

class RequestRenovationEstimateCommand {
  static async execute({ turnoverId, apartmentId, requestedLevels, scopeNotes, targetReadyDate, nextActorEmail }) {
    const id = uuidv4();

    const renovationCase = new RenovationCase({
      id,
      turnoverId,
      apartmentId,
      requestedLevels,
      scopeNotes,
      targetReadyDate,
      nextActorEmail,
    });

    await db.insert('Renovation Case', renovationCase.toJSON());

    return renovationCase.toJSON();
  }
}

export default RequestRenovationEstimateCommand;