import db from '../../infrastructure/db/index.js';

class GetAllApartmentsReadModel {
  static async query() {
    // The business logic "Get All Apartments" implies fetching all records from the 'Apartment' collection.
    // The collection name 'Apartment' is inferred from the read model description and OpenAPI specification.
    return await db.findAll('Apartment');
  }
}

export default GetAllApartmentsReadModel;