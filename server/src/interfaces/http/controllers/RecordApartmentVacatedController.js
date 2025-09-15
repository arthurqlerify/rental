import express from 'express';
import RecordApartmentVacatedCommand from '../../../domain/command/RecordApartmentVacatedCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, apartmentId, vacatedAt, keysReturned, notes, nextActorEmail } = req.body;

    if (!id || !apartmentId || !vacatedAt || !keysReturned || !nextActorEmail) {
      return res.status(400).json({ message: "Missing required fields: id, apartmentId, vacatedAt, keysReturned, nextActorEmail." });
    }

    const result = await RecordApartmentVacatedCommand.execute({
      id,
      apartmentId,
      vacatedAt,
      keysReturned,
      notes: notes || '', // Allow notes to be optional if not provided
      nextActorEmail,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/record-apartment-vacated',
  router,
};