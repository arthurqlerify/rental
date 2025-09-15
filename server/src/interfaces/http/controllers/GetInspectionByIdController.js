import express from 'express';
import GetInspectionByIdReadModel from '../../../domain/readmodel/GetInspectionByIdReadModel.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inspection = await GetInspectionByIdReadModel.query(id);

    if (inspection) {
      res.status(200).json(inspection);
    } else {
      res.status(400).json({ message: 'Inspection not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-inspection-by-id',
  router,
};