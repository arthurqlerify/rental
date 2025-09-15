import express from 'express';
import CreateApartmentCommand from '../../../domain/command/CreateApartmentCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { propertyId, unitNumber, floorAreaSqm, bedrooms, status } = req.body;
    const result = await CreateApartmentCommand.execute({
      propertyId,
      unitNumber,
      floorAreaSqm,
      bedrooms,
      status,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/create-apartment',
  router,
};