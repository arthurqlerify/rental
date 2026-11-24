import express from 'express';
import WriteApartmentNoteCommand from '../../../domain/command/WriteApartmentNoteCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { apartmentId, note } = req.body;

    // The note may be empty, which clears it, but it must be sent.
    if (!apartmentId || note === undefined) {
      return res.status(400).json({ message: 'Missing required fields: apartmentId and note are required.' });
    }

    const result = await WriteApartmentNoteCommand.execute({ apartmentId, note });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/write-apartment-note',
  router,
};
