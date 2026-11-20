import express from 'express';
import RescheduleInspectionCommand from '../../../domain/command/RescheduleInspectionCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, scheduledAt, assignedToEmail } = req.body;

    if (!id || (!scheduledAt && !assignedToEmail)) {
      return res.status(400).json({ message: 'Missing required fields: id and a new scheduledAt or assignedToEmail are required.' });
    }

    const result = await RescheduleInspectionCommand.execute({ id, scheduledAt, assignedToEmail });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/reschedule-inspection',
  router,
};
