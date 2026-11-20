import express from 'express';
import CancelInspectionCommand from '../../../domain/command/CancelInspectionCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id, reason } = req.body;

    if (!id || !reason) {
      return res.status(400).json({ message: 'Missing required fields: id and reason are required.' });
    }

    const result = await CancelInspectionCommand.execute({ id, reason });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/cancel-inspection',
  router,
};
