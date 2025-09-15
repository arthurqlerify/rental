import express from 'express';
import ScheduleInspectionCommand from '../../../domain/command/ScheduleInspectionCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { turnoverId, apartmentId, scheduledAt, assignedToEmail, locationNotes, nextActorEmail } = req.body;
    const result = await ScheduleInspectionCommand.execute({
      turnoverId,
      apartmentId,
      scheduledAt,
      assignedToEmail,
      locationNotes,
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/schedule-inspection',
  router,
};