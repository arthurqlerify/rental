import express from 'express';
import CompleteWorkOrderCommand from '../../../domain/command/CompleteWorkOrderCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, apartmentId, actualStartDate, actualEndDate, completionNotes, photosUrl, varianceNotes, nextActorEmail } = req.body;

    const result = await CompleteWorkOrderCommand.execute({
      id,
      apartmentId, // apartmentId is part of the request but not directly used in the command's update logic for completion. It's an identifier.
      actualStartDate,
      actualEndDate,
      completionNotes,
      photosUrl,
      varianceNotes,
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/complete-work-order',
  router,
};