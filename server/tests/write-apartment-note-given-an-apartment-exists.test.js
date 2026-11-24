import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { onDay } from './support/clock.js';
import { createProperty, createLease } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'write-apartment-note-given-an-apartment-exists.feature'));

// The note is written on this day, so it is saved at noon UTC on it.
const NOTE_DAY = '2025-09-15';
const NOTE_SAVED_AT = `${NOTE_DAY}T12:00:00.000Z`;
const NOTE = 'The front door key sticks. Call the neighbour in 22A, Kim, if it will not turn.';

let unitCount = 0;

const createApartment = async (status) => {
  unitCount += 1;
  const propertyId = await createProperty();
  const response = await request(app)
    .post('/api/v1/create-apartment')
    .send({ propertyId, unitNumber: `NOTE-${unitCount}`, floorAreaSqm: '60', bedrooms: '2', status });
  expect(response.statusCode).toBe(200);
  return response.body.id;
};

const writeNote = (apartmentId, note) =>
  onDay(NOTE_DAY, () => request(app).post('/api/v1/write-apartment-note').send({ apartmentId, note }));

const findApartment = async (apartmentId) => {
  const response = await request(app).get('/api/v1/get-all-apartments');
  expect(response.statusCode).toBe(200);
  return response.body.find((apartment) => apartment.id === apartmentId);
};

defineFeature(feature, test => {
  test(
    'Given an apartment with a tenant and no note, When the PropertyMgr writes a note on it, Then the note is kept with the time it was saved and the Apartments list shows it.',
    ({ given, when, then }) => {
      let apartmentId;
      let response;

      given('an apartment with a tenant and no note', async () => {
        const propertyId = await createProperty();
        const lease = await createLease({ propertyId, tenantName: 'Robin Park', currentRent: '1200' });
        apartmentId = lease.apartmentId;

        const apartment = await findApartment(apartmentId);
        expect(apartment.status).toBe('Occupied');
        expect(apartment.note).toBeUndefined();
      });

      when('the PropertyMgr writes a note on it', async () => {
        // Spaces around the note are not kept.
        response = await writeNote(apartmentId, `  ${NOTE}\n`);
      });

      then('the note is kept with the time it was saved and the Apartments list shows it.', async () => {
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(apartmentId);
        expect(response.body.note).toBe(NOTE);
        expect(response.body.noteUpdatedAt).toBe(NOTE_SAVED_AT);

        const apartment = await findApartment(apartmentId);
        expect(apartment.status).toBe('Occupied');
        expect(apartment.note).toBe(NOTE);
        expect(apartment.noteUpdatedAt).toBe(NOTE_SAVED_AT);
      });
    }
  );

  test(
    'Given an apartment with a note, When the PropertyMgr writes a new note of 500 characters on it, Then the new note replaces the old one.',
    ({ given, when, then }) => {
      // 13 sentences of 38 characters, then dots up to 500, so it ends in no space that would be trimmed.
      const newNote = 'Water meter is behind the bath panel. '.repeat(13).padEnd(500, '.');
      let apartmentId;
      let response;

      given('an apartment with a note', async () => {
        apartmentId = await createApartment('Ready');
        const first = await request(app).post('/api/v1/write-apartment-note').send({ apartmentId, note: NOTE });
        expect(first.statusCode).toBe(200);
      });

      when('the PropertyMgr writes a new note of 500 characters on it', async () => {
        expect(newNote).toHaveLength(500);
        response = await writeNote(apartmentId, newNote);
      });

      then('the new note replaces the old one.', async () => {
        expect(response.statusCode).toBe(200);

        const apartment = await findApartment(apartmentId);
        expect(apartment.note).toBe(newNote);
        expect(apartment.noteUpdatedAt).toBe(NOTE_SAVED_AT);
      });
    }
  );

  test(
    'Given an apartment with a note, When the PropertyMgr saves an empty note on it, Then the apartment no longer has a note.',
    ({ given, when, then }) => {
      let apartmentId;
      let emptyResponse;
      let blankResponse;

      given('an apartment with a note', async () => {
        apartmentId = await createApartment('Vacant');
        const first = await request(app).post('/api/v1/write-apartment-note').send({ apartmentId, note: NOTE });
        expect(first.statusCode).toBe(200);
      });

      when('the PropertyMgr saves an empty note on it', async () => {
        emptyResponse = await writeNote(apartmentId, '');
        expect(emptyResponse.statusCode).toBe(200);

        // A note of only spaces clears it too.
        await request(app).post('/api/v1/write-apartment-note').send({ apartmentId, note: NOTE });
        blankResponse = await writeNote(apartmentId, '   ');
      });

      then('the apartment no longer has a note.', async () => {
        expect(emptyResponse.body.note).toBeNull();
        expect(emptyResponse.body.noteUpdatedAt).toBeNull();
        expect(blankResponse.statusCode).toBe(200);
        expect(blankResponse.body.note).toBeNull();

        const apartment = await findApartment(apartmentId);
        expect(apartment.note).toBeNull();
        expect(apartment.noteUpdatedAt).toBeNull();
      });
    }
  );

  test(
    'Given an empty apartment with a note, When a tenant moves in and later leaves, Then the note is still on the apartment.',
    ({ given, when, then }) => {
      let apartmentId;
      let propertyId;

      given('an empty apartment with a note', async () => {
        propertyId = await createProperty();
        const apartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send({ propertyId, unitNumber: 'NOTE-STAYS', floorAreaSqm: '60', bedrooms: '2', status: 'Vacant' });
        expect(apartmentResponse.statusCode).toBe(200);
        apartmentId = apartmentResponse.body.id;

        const noteResponse = await writeNote(apartmentId, NOTE);
        expect(noteResponse.statusCode).toBe(200);
      });

      when('a tenant moves in and later leaves', async () => {
        const leaseResponse = await request(app)
          .post('/api/v1/create-lease')
          .send({
            apartmentId,
            currentRent: '1500',
            startDate: '2025-01-01',
            endDate: '2025-09-30',
            nextActorEmail: 'pm@rentco.com',
            tenantName: 'Sam Lee'
          });
        expect(leaseResponse.statusCode).toBe(200);
        expect((await findApartment(apartmentId)).note).toBe(NOTE);

        const turnoverResponse = await request(app)
          .post('/api/v1/create-turnover')
          .send({
            leaseId: leaseResponse.body.id,
            apartmentId,
            targetReadyDate: '2025-10-15',
            propertyId,
            nextActorEmail: 'inspections@rentco.com'
          });
        expect(turnoverResponse.statusCode).toBe(200);

        const vacatedResponse = await request(app)
          .post('/api/v1/record-apartment-vacated')
          .send({
            id: turnoverResponse.body.id,
            apartmentId,
            vacatedAt: '2025-09-30T10:00',
            keysReturned: 'true',
            notes: 'Keys returned.',
            nextActorEmail: 'inspections@rentco.com'
          });
        expect(vacatedResponse.statusCode).toBe(200);
      });

      then('the note is still on the apartment.', async () => {
        const apartment = await findApartment(apartmentId);
        expect(apartment.status).toBe('Vacant');
        expect(apartment.note).toBe(NOTE);
        expect(apartment.noteUpdatedAt).toBe(NOTE_SAVED_AT);
      });
    }
  );
});
