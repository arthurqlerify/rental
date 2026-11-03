import express from 'express';
import ChargeRentCommand from '../../../domain/command/ChargeRentCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { leaseId, month } = req.body;

    if (!leaseId || !month) {
      return res.status(400).json({ message: 'Missing required fields: leaseId and month are required.' });
    }

    const result = await ChargeRentCommand.execute({ leaseId, month });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/charge-rent',
  router,
};
