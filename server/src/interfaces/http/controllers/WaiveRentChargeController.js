import express from 'express';
import WaiveRentChargeCommand from '../../../domain/command/WaiveRentChargeCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, reason } = req.body;

    if (!id || !reason) {
      return res.status(400).json({ message: 'Missing required fields: id and reason are both required.' });
    }

    const result = await WaiveRentChargeCommand.execute({ id, reason });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/waive-rent-charge',
  router,
};
