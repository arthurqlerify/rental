import express from 'express';
import RequestRenovationEstimateCommand from '../../../domain/command/RequestRenovationEstimateCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { turnoverId, apartmentId, requestedLevels, scopeNotes, targetReadyDate, nextActorEmail } = req.body;

    if (!turnoverId || !apartmentId || !requestedLevels || !scopeNotes || !targetReadyDate || !nextActorEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await RequestRenovationEstimateCommand.execute({
      turnoverId,
      apartmentId,
      requestedLevels,
      scopeNotes,
      targetReadyDate,
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/request-renovation-estimate',
  router,
};