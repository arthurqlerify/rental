import express from 'express';
import IssueMonthlyRentChargesCommand from '../../../domain/command/IssueMonthlyRentChargesCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ message: 'Missing required field: month is required.' });
    }

    const result = await IssueMonthlyRentChargesCommand.execute({ month });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/issue-monthly-rent-charges',
  router,
};
