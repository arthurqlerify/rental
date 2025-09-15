import express from 'express';
import SelectRenovationPlanCommand from '../../../domain/command/SelectRenovationPlanCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, apartmentId, selectedLevel, budgetApproved, expectedCompletionDate, projectedRent, decisionReason, nextActorEmail } = req.body;

    const result = await SelectRenovationPlanCommand.execute({
      id,
      apartmentId, // Passed for context, not updated by command logic in this scenario
      selectedLevel,
      budgetApproved,
      expectedCompletionDate,
      projectedRent,
      decisionReason,
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/select-renovation-plan',
  router,
};