import db from '../../infrastructure/db/index.js';
import RenovationCase from '../entity/RenovationCase.js';

class SelectRenovationPlanCommand {
  static async execute({ id, selectedLevel, budgetApproved, expectedCompletionDate, projectedRent, decisionReason, nextActorEmail }) {
    const existingRenovationCase = await db.findById('Renovation Case', id);

    if (!existingRenovationCase) {
      throw new Error(`Renovation Case with ID ${id} not found.`);
    }

    // "Then Renovation Plan Selected is recorded with the chosen level, budget and expected completion window."
    const updates = {
      selectedLevel,
      budgetApproved,
      expectedCompletionDate,
      projectedRent,
      decisionReason,
      nextActorEmail,
    };

    const updatedRenovationCase = new RenovationCase({ ...existingRenovationCase, ...updates });

    await db.update('Renovation Case', id, updatedRenovationCase.toJSON());

    return updatedRenovationCase.toJSON();
  }
}

export default SelectRenovationPlanCommand;