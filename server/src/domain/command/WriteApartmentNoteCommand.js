import Apartment from '../entity/Apartment.js';
import db from '../../infrastructure/db/index.js';

export const MAX_NOTE_LENGTH = 500;

class WriteApartmentNoteCommand {
  static async execute({ apartmentId, note }) {
    // GIVEN: the apartment exists, whatever its status
    const apartment = await db.findById('Apartment', apartmentId);
    if (!apartment) {
      throw new Error(`Apartment with ID ${apartmentId} not found.`);
    }

    // GIVEN: a note of at most 500 characters; an empty one clears the apartment's note
    const text = String(note ?? '').trim();
    if (text.length > MAX_NOTE_LENGTH) {
      throw new Error(`A note can be at most ${MAX_NOTE_LENGTH} characters.`);
    }

    // WHEN: the PropertyMgr saves the note
    // THEN: Apartment Note Written is recorded; it replaces the apartment's earlier note
    const updates = text
      ? { note: text, noteUpdatedAt: new Date().toISOString() }
      : { note: null, noteUpdatedAt: null };
    await db.update('Apartment', apartmentId, updates);

    return new Apartment({ ...apartment, ...updates }).toJSON();
  }
}

export default WriteApartmentNoteCommand;
