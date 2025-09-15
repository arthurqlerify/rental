import express from 'express';
import CreateTurnoverCommand from '../../../domain/command/CreateTurnoverCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { leaseId, apartmentId, targetReadyDate, propertyId, nextActorEmail } = req.body;

    const result = await CreateTurnoverCommand.execute({
      leaseId,
      apartmentId,
      targetReadyDate,
      propertyId,
      nextActorEmail,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/create-turnover',
  router,
};