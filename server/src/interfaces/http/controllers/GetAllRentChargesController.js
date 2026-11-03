import express from 'express';
import GetAllRentChargesReadModel from '../../../domain/readmodel/GetAllRentChargesReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { propertyId, leaseId, asOf } = req.query;
    const charges = await GetAllRentChargesReadModel.query({ propertyId, leaseId, asOf: asOf || undefined });
    res.status(200).json(charges);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-rent-charges',
  router,
};
