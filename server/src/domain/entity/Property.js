import { v4 as uuidv4 } from 'uuid';

class Property {
  constructor({ id = uuidv4(), name, address, managerName, managerEmail, unitsCount }) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.managerName = managerName;
    this.managerEmail = managerEmail;
    this.unitsCount = unitsCount;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      managerName: this.managerName,
      managerEmail: this.managerEmail,
      unitsCount: this.unitsCount,
    };
  }
}

export default Property;