import express from 'express';
import CompleteTurnoverCommand from '../../../domain/command/CompleteTurnoverCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, readyToRentDate, listingReady, marketingEmail, apartmentId, notes } = req.body;

    const result = await CompleteTurnoverCommand.execute({
      id,
      readyToRentDate,
      listingReady,
      marketingEmail,
      apartmentId,
      notes,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/complete-turnover',
  router,
};