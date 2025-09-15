import express from 'express';
import GetAllInspectionsReadModel from '../../../domain/readmodel/GetAllInspectionsReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const inspections = await GetAllInspectionsReadModel.query();
    res.status(200).json(inspections);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-inspections',
  router,
};