import express from 'express';
import CreatePropertyCommand from '../../../domain/command/CreatePropertyCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, address, managerName, managerEmail, unitsCount } = req.body;

    const result = await CreatePropertyCommand.execute({
      name,
      address,
      managerName,
      managerEmail,
      unitsCount,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/create-property',
  router,
};