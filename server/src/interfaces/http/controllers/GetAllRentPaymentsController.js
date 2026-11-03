import express from 'express';
import GetAllRentPaymentsReadModel from '../../../domain/readmodel/GetAllRentPaymentsReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { propertyId, leaseId } = req.query;
    const payments = await GetAllRentPaymentsReadModel.query({ propertyId, leaseId });
    res.status(200).json(payments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-rent-payments',
  router,
};
