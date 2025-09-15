import db from '../../infrastructure/db/index.js';

class GetAllLeasesReadModel {
  static async query() {
    return await db.findAll('Lease');
  }
}

export default GetAllLeasesReadModel;