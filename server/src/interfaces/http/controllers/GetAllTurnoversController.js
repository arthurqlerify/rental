import express from 'express';
import GetAllTurnoversReadModel from '../../../domain/readmodel/GetAllTurnoversReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const turnovers = await GetAllTurnoversReadModel.query();
    res.status(200).json(turnovers);
  } catch (err) {
    // Log the error for debugging purposes (not part of the response based on rules)
    console.error(`Error retrieving all turnovers: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default {
  routeBase: '/get-all-turnovers',
  router,
};