import express from 'express';
import GetAllPropertysReadModel from '../../../domain/readmodel/GetAllPropertysReadModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const propertys = await GetAllPropertysReadModel.query();
    res.status(200).json(propertys);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-all-propertys',
  router,
};