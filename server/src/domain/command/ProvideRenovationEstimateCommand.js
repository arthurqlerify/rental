import db from '../../infrastructure/db/index.js';

class ProvideRenovationEstimateCommand {
  static async execute({ id, costGood, costBetter, costPremium, leadDaysGood, leadDaysBetter, leadDaysPremium, nextActorEmail }) {
    const renovationCase = await db.findById('Renovation Case', id);

    if (!renovationCase) {
      throw new Error(`Renovation Case with ID ${id} not found.`);
    }

    const updatedRenovationCase = {
      ...renovationCase,
      costGood,
      costBetter,
      costPremium,
      leadDaysGood,
      leadDaysBetter,
      leadDaysPremium,
      nextActorEmail,
    };

    await db.update('Renovation Case', id, updatedRenovationCase);

    return updatedRenovationCase;
  }
}

export default ProvideRenovationEstimateCommand;