import express from 'express';
import GetRentSummaryReadModel from '../../../domain/readmodel/GetRentSummaryReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { asOf } = req.query;
    const summary = await GetRentSummaryReadModel.query({ asOf });
    res.status(200).json(summary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-rent-summary',
  router,
};
