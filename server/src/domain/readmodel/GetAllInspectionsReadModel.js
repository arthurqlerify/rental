import db from '../../infrastructure/db/index.js';

class GetAllInspectionsReadModel {
  static async query() {
    return await db.findAll('Inspection');
  }
}

export default GetAllInspectionsReadModel;