import express from 'express';
import PassFinalInspectionCommand from '../../../domain/command/PassFinalInspectionCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, turnoverId, apartmentId, passedAt, inspectorName, certificateUrl, nextActorEmail } = req.body;

    const result = await PassFinalInspectionCommand.execute({
      id,
      turnoverId,
      apartmentId,
      passedAt,
      inspectorName,
      certificateUrl,
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/pass-final-inspection',
  router,
};