import express from 'express';
import GetAllLeaseBalancesReadModel from '../../../domain/readmodel/GetAllLeaseBalancesReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { propertyId, leaseId, asOf } = req.query;
    const balances = await GetAllLeaseBalancesReadModel.query({ propertyId, leaseId, asOf });
    res.status(200).json(balances);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-lease-balances',
  router,
};
