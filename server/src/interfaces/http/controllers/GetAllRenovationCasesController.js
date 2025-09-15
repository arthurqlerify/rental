import express from 'express';
import GetAllRenovationCasesReadModel from '../../../domain/readmodel/GetAllRenovationCasesReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const renovationCases = await GetAllRenovationCasesReadModel.query();
    res.status(200).json(renovationCases);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-renovation-cases',
  router,
};