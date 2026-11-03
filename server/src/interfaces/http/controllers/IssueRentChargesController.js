import express from 'express';
import IssueRentChargesCommand from '../../../domain/command/IssueRentChargesCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ message: 'Missing required field: month (YYYY-MM).' });
    }

    const result = await IssueRentChargesCommand.execute({ month });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/issue-rent-charges',
  router,
};
