import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';
import { createProperty } from './support/rentFixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'write-apartment-note-rejected-given-a-note-longer-than-500-characters.feature'));

const NOTE = 'Boiler service is due in March.';

const findApartment = async (apartmentId) => {
  const response = await request(app).get('/api/v1/get-all-apartments');
  expect(response.statusCode).toBe(200);
  return response.body.find((apartment) => apartment.id === apartmentId);
};

defineFeature(feature, test => {
  test(
    'Given an apartment with a note, When the PropertyMgr writes a note longer than 500 characters on it, Then the request is refused and the earlier note is kept.',
    ({ given, when, then }) => {
      let apartmentId;
      let savedNote;
      let response;

      given('an apartment with a note', async () => {
        const propertyId = await createProperty();
        const apartmentResponse = await request(app)
          .post('/api/v1/create-apartment')
          .send({ propertyId, unitNumber: 'LONG-1', floorAreaSqm: '60', bedrooms: '2', status: 'Vacant' });
        expect(apartmentResponse.statusCode).toBe(200);
        apartmentId = apartmentResponse.body.id;

        const noteResponse = await request(app).post('/api/v1/write-apartment-note').send({ apartmentId, note: NOTE });
        expect(noteResponse.statusCode).toBe(200);
        savedNote = noteResponse.body;
      });

      when('the PropertyMgr writes a note longer than 500 characters on it', async () => {
        response = await request(app)
          .post('/api/v1/write-apartment-note')
          .send({ apartmentId, note: 'x'.repeat(501) });
      });

      then('the request is refused and the earlier note is kept.', async () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('A note can be at most 500 characters.');

        const apartment = await findApartment(apartmentId);
        expect(apartment.note).toBe(NOTE);
        expect(apartment.noteUpdatedAt).toBe(savedNote.noteUpdatedAt);
      });
    }
  );
});
