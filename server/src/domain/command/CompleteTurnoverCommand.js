import db from '../../infrastructure/db/index.js';
import Turnover from '../entity/Turnover.js'; // Using Turnover entity for consistency and potential internal logic if it had any

class CompleteTurnoverCommand {
  static async execute({ id, readyToRentDate, listingReady, marketingEmail, apartmentId, notes }) {
    // 1. Retrieve the Turnover record
    const turnoverData = await db.findById('Turnover', id);

    if (!turnoverData) {
      throw new Error(`Turnover with ID ${id} not found.`);
    }

    // Instantiate Turnover entity to easily access and validate properties based on GWT.
    const turnover = new Turnover(turnoverData);

    // 2. Validate pre-conditions based on GWT:
    // "Given the final inspection has passed and there are no open work orders"
    if (!turnover.finalInspectionPassedAt) {
      throw new Error('Final inspection has not passed for this turnover.');
    }

    // OpenAPI example for openWorkOrdersCount is a string: '0'. Compare as string.
    if (turnover.openWorkOrdersCount !== '0') {
      throw new Error(`There are ${turnover.openWorkOrdersCount} open work orders for this turnover.`);
    }

    // 3. Update the Turnover record
    // "When Automation completes the turnover case, Then Turnover Completed is recorded and the apartment status becomes ready to rent and marketing is notified."
    // Update turnover with new data provided in the command, representing completion and notification.
    const updatedFields = {
      readyToRentDate,
      listingReady,
      marketingEmail,
      apartmentId, // apartmentId is in the request body, so include in update.
      notes,       // notes is in the request body, so include in update.
    };

    const updatedTurnover = await db.update('Turnover', id, updatedFields);

    if (!updatedTurnover) {
      throw new Error(`Failed to update Turnover with ID ${id}.`);
    }

    // Return the updated turnover object as per the OpenAPI spec's implicit success response.
    return updatedTurnover;
  }
}

export default CompleteTurnoverCommand;