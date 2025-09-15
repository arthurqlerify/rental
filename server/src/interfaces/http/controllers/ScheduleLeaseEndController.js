import express from 'express';
import ScheduleLeaseEndCommand from '../../../domain/command/ScheduleLeaseEndCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, apartmentId, endDate, noticeDate, currentRent, nextActorEmail } = req.body;

    const result = await ScheduleLeaseEndCommand.execute({
      id,
      apartmentId,
      endDate,
      noticeDate,
      currentRent,
      nextActorEmail,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/schedule-lease-end',
  router,
};