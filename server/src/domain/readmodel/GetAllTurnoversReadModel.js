import db from '../../infrastructure/db/index.js';

class GetAllTurnoversReadModel {
  static async query() {
    // The description "Get All Turnovers" implies fetching all turnover records.
    // The OpenAPI spec defines this as a simple GET with no parameters,
    // further reinforcing that no specific filtering is applied for this read model.
    return await db.findAll('Turnover');
  }
}

export default GetAllTurnoversReadModel;