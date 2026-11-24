import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'write-apartment-note-rejected-given-the-apartment-does-not-exist.feature'));

defineFeature(feature, test => {
  test(
    'Given no apartment with the given ID, When the PropertyMgr writes a note on it, Then the request is refused.',
    ({ given, when, then }) => {
      const apartmentId = 'apt-does-not-exist';
      let response;
      let missingNoteResponse;

      given('no apartment with the given ID', async () => {
        const apartments = await request(app).get('/api/v1/get-all-apartments');
        expect(apartments.body.find((apartment) => apartment.id === apartmentId)).toBeUndefined();
      });

      when('the PropertyMgr writes a note on it', async () => {
        response = await request(app)
          .post('/api/v1/write-apartment-note')
          .send({ apartmentId, note: 'The key sticks.' });
        // A request without the note field at all is refused before the apartment is looked up.
        missingNoteResponse = await request(app).post('/api/v1/write-apartment-note').send({ apartmentId });
      });

      then('the request is refused.', () => {
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(`Apartment with ID ${apartmentId} not found.`);
        expect(missingNoteResponse.statusCode).toBe(400);
        expect(missingNoteResponse.body.message).toBe('Missing required fields: apartmentId and note are required.');
      });
    }
  );
});
