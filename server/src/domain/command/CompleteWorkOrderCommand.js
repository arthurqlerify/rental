import db from '../../infrastructure/db/index.js';

class CompleteWorkOrderCommand {
  static async execute({ id, actualStartDate, actualEndDate, completionNotes, photosUrl, varianceNotes, nextActorEmail }) {
    const workOrder = await db.findById('Work Order', id);

    if (!workOrder) {
      throw new Error(`Work Order with ID ${id} not found.`);
    }

    // Update the work order with completion details and new next actor
    const updatedFields = {
      actualStartDate,
      actualEndDate,
      completionNotes,
      photosUrl,
      varianceNotes,
      nextActorEmail, // Update nextActorEmail as it's provided in the completion report
    };

    const updatedWorkOrder = await db.update('Work Order', id, updatedFields);
    return updatedWorkOrder;
  }
}

export default CompleteWorkOrderCommand;