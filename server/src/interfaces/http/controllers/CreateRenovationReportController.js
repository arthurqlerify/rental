import express from 'express';
import CreateRenovationReportCommand from '../../../domain/command/CreateRenovationReportCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { turnoverId, inspectionId, apartmentId, damageSeverity, estimatedRepairCost, damageSummary, nextActorEmail } = req.body;

    const result = await CreateRenovationReportCommand.execute({
      turnoverId,
      inspectionId,
      apartmentId,
      damageSeverity,
      estimatedRepairCost,
      damageSummary,
      nextActorEmail,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/create-renovation-report',
  router,
};