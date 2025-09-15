import express from 'express';
import GetAllApartmentsReadModel from '../../../domain/readmodel/GetAllApartmentsReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const apartments = await GetAllApartmentsReadModel.query();
    res.status(200).json(apartments);
  } catch (err) {
    // As per rules, only 200 and 400 status codes are allowed.
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-apartments',
  router,
};