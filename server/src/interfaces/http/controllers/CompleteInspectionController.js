import express from 'express';
import CompleteInspectionCommand from '../../../domain/command/CompleteInspectionCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, turnoverId, apartmentId, completedAt, findingsSummary, hasDamages, photosUrl, nextActorEmail } = req.body;
    const result = await CompleteInspectionCommand.execute({
      id,
      turnoverId,
      apartmentId,
      completedAt,
      findingsSummary,
      hasDamages,
      photosUrl,
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/complete-inspection',
  router,
};