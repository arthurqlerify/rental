import express from 'express';
import GetLeaseByIdReadModel from '../../../domain/readmodel/GetLeaseByIdReadModel.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lease = await GetLeaseByIdReadModel.query(id);

    if (!lease) {
      return res.status(400).json({ message: 'Lease not found' });
    }

    // Strictly conform to OpenAPI response schema
    const responseData = {
      id: lease.id,
      apartmentId: lease.apartmentId,
      tenantName: lease.tenantName,
      noticeDate: lease.noticeDate,
      currentRent: lease.currentRent,
      propertyId: lease.propertyId,
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
  routeBase: '/get-lease-by-id',
  router,
};