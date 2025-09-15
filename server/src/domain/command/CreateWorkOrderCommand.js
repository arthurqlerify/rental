import { v4 as uuidv4 } from 'uuid';
import WorkOrder from '../entity/WorkOrder.js';
import db from '../../infrastructure/db/index.js';

class CreateWorkOrderCommand {
  static async execute({ renovationCaseId, turnoverId, apartmentId, scopeSummary, accessDetails, materialsList, nextActorEmail }) {
    const workOrder = new WorkOrder({
      id: uuidv4(), // Generate a unique ID for the new Work Order
      renovationCaseId,
      turnoverId,
      apartmentId,
      scopeSummary,
      accessDetails,
      materialsList,
      nextActorEmail,
    });

    await db.insert('Work Order', workOrder.toJSON());
    return workOrder.toJSON();
  }
}

export default CreateWorkOrderCommand;