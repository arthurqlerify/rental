import db from '../../infrastructure/db/index.js';

class GetAllPropertysReadModel {
  static async query() {
    return await db.findAll('Property');
  }
}

export default GetAllPropertysReadModel;