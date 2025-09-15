import express from 'express';
import MarkLeaseEndedCommand from '../../../domain/command/MarkLeaseEndedCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, apartmentId, endDate, moveOutConfirmedAt, turnoverId, nextActorEmail } = req.body;
    const result = await MarkLeaseEndedCommand.execute({
      id,
      apartmentId,
      endDate,
      moveOutConfirmedAt,
      turnoverId,
      nextActorEmail,
    });
    res.status(200).json(result); // OpenAPI specifies 200 for success
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/mark-lease-ended',
  router,
};