import express from 'express';
import CreateLeaseCommand from '../../../domain/command/CreateLeaseCommand.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { apartmentId, currentRent, nextActorEmail, tenantName } = req.body;
    
    // Validate required fields based on OpenAPI specification's requestBody schema
    if (!apartmentId || !currentRent || !nextActorEmail || !tenantName) {
      return res.status(400).json({ message: 'Missing required fields: apartmentId, currentRent, nextActorEmail, and tenantName are all required.' });
    }

    const result = await CreateLeaseCommand.execute({
      apartmentId,
      currentRent,
      nextActorEmail,
      tenantName,
    });
    // OpenAPI spec defines 200 for a successful response.
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/create-lease', // Matches the path defined in OpenAPI
  router,
};