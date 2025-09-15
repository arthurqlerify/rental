import { v4 as uuidv4 } from 'uuid';
import Property from '../entity/Property.js';
import db from '../../infrastructure/db/index.js';

class CreatePropertyCommand {
  static async execute({ name, address, managerName, managerEmail, unitsCount }) {
    // Given no property exists at the specified address
    const existingProperties = await db.findAll('Property');
    const propertyExists = existingProperties.some(
      (property) => property.address === address
    );

    if (propertyExists) {
      throw new Error('A property already exists at the specified address.');
    }

    // and a positive unitsCount
    const parsedUnitsCount = parseInt(unitsCount, 10);
    if (isNaN(parsedUnitsCount) || parsedUnitsCount <= 0) {
      throw new Error('unitsCount must be a positive number.');
    }

    // Then Property Created is recorded with a new propertyId and the provided details
    const property = new Property({
      id: uuidv4(),
      name,
      address,
      managerName,
      managerEmail,
      unitsCount, // unitsCount is a string in the OpenAPI spec
    });

    await db.insert('Property', property.toJSON());

    // and the property becomes available to create apartments under it.
    // (This part of the GWT description implies system state change, not direct return value)
    return property.toJSON();
  }
}

export default CreatePropertyCommand;