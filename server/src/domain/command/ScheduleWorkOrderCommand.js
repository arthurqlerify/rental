import WorkOrder from '../entity/WorkOrder.js';
import db from '../../infrastructure/db/index.js';

class ScheduleWorkOrderCommand {
  static async execute({
    id,
    apartmentId,
    startDate,
    endDate,
    crewName,
    assignedToEmail,
    materialsReady,
    nextActorEmail,
  }) {
    const existingWorkOrder = await db.findById('Work Order', id);

    if (!existingWorkOrder) {
      throw new Error(`Work Order with ID ${id} not found.`);
    }

    // GWT: When the ConstrDept assigns a crew and sets start and end dates,
    // Then Work Order Scheduled is recorded with dates and assigned team.
    // Also including other fields from the requestBody as per OpenAPI.
    const updatedWorkOrderData = {
      ...existingWorkOrder, // Keep existing fields
      apartmentId, // apartmentId is part of the request, so potentially update/set
      startDate,
      endDate,
      crewName,
      assignedToEmail,
      materialsReady,
      nextActorEmail,
    };

    const updatedWorkOrder = await db.update('Work Order', id, updatedWorkOrderData);

    if (!updatedWorkOrder) {
      throw new Error(`Failed to update Work Order with ID ${id}.`);
    }

    // The command should return the updated WorkOrder entity.
    return new WorkOrder(updatedWorkOrder).toJSON();
  }
}

export default ScheduleWorkOrderCommand;