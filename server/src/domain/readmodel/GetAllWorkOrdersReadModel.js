import db from '../../infrastructure/db/index.js';

class GetAllWorkOrdersReadModel {
  static async query() {
    return await db.findAll('Work Order');
  }
}

export default GetAllWorkOrdersReadModel;