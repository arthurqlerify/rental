import db from '../../infrastructure/db/index.js';

class GetInspectionByIdReadModel {
  static async query(id) {
    // The collection name 'Inspection' comes from the Related Entity Information.
    return await db.findById('Inspection', id);
  }
}

export default GetInspectionByIdReadModel;