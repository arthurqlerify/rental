import db from '../../infrastructure/db/index.js';

class GetLeaseByIdReadModel {
  static async query(id) {
    return await db.findById('Lease', id);
  }
}

export default GetLeaseByIdReadModel;