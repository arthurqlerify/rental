import express from 'express';
import CreateWorkOrderCommand from '../../../domain/command/CreateWorkOrderCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { renovationCaseId, turnoverId, apartmentId, scopeSummary, accessDetails, materialsList, nextActorEmail } = req.body;
    const result = await CreateWorkOrderCommand.execute({
      renovationCaseId,
      turnoverId,
      apartmentId,
      scopeSummary,
      accessDetails,
      materialsList,
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/create-work-order',
  router,
};