import express from 'express';
import GetAllWorkOrdersReadModel from '../../../domain/readmodel/GetAllWorkOrdersReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const workOrders = await GetAllWorkOrdersReadModel.query();
    res.status(200).json(workOrders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-work-orders',
  router,
};