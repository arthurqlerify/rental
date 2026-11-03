import express from 'express';
import RecordRentPaymentCommand from '../../../domain/command/RecordRentPaymentCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { leaseId, amount, paidOn, method } = req.body;

    if (!leaseId || !amount || !paidOn || !method) {
      return res.status(400).json({ message: 'Missing required fields: leaseId, amount, paidOn and method are all required.' });
    }

    const result = await RecordRentPaymentCommand.execute({ leaseId, amount, paidOn, method });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/record-rent-payment',
  router,
};
