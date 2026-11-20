import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import YAML from 'yamljs';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'api-docs-describe-the-inspection-endpoints.feature'));

const controllersPath = path.resolve(__dirname, '../src/interfaces/http/controllers');

const resolve = (docs, ref) => ref.replace('#/', '').split('/').reduce((node, key) => node?.[key], docs);

// '/get-inspection-by-id' with the route '/:id' is documented as '/get-inspection-by-id/{id}'.
const docsPath = (routeBase, routePath) =>
  `${routeBase}${routePath === '/' ? '' : routePath.replace(/:(\w+)/g, '{$1}')}`;

defineFeature(feature, test => {
  let inspectionEndpoints;
  let docsPageResponse;
  let docs;

  test(
    'Given the inspection endpoints the API serves, When a developer opens the API docs at /api/docs, Then each inspection endpoint is described, with how to reschedule and cancel an inspection.',
    ({ given, when, then }) => {
      given('the inspection endpoints the API serves', async () => {
        // Read from the controllers themselves, so an inspection endpoint added later without docs fails here.
        inspectionEndpoints = [];
        for (const file of fs.readdirSync(controllersPath).filter((f) => /Inspection/.test(f))) {
          const controller = (await import(pathToFileURL(path.join(controllersPath, file)).href)).default;
          for (const layer of controller.router.stack) {
            for (const method of Object.keys(layer.route.methods)) {
              inspectionEndpoints.push({ route: docsPath(controller.routeBase, layer.route.path), method });
            }
          }
        }
        expect(inspectionEndpoints.map((e) => e.route).sort()).toEqual([
          '/cancel-inspection',
          '/complete-inspection',
          '/get-all-inspections',
          '/get-inspection-by-id/{id}',
          '/pass-final-inspection',
          '/reschedule-inspection',
          '/schedule-inspection',
        ]);
      });

      when('a developer opens the API docs at /api/docs', async () => {
        docsPageResponse = await request(app).get('/api/docs/');
        docs = YAML.load(path.resolve(__dirname, '../src/docs/swagger.yaml'));
      });

      then('each inspection endpoint is described, with how to reschedule and cancel an inspection.', async () => {
        expect(docsPageResponse.statusCode).toBe(200);

        for (const { route, method } of inspectionEndpoints) {
          const operation = docs.paths[route]?.[method];
          expect({ route, method, documented: Boolean(operation) }).toEqual({ route, method, documented: true });
          expect(typeof operation.description).toBe('string');
          expect(operation.responses['200'].content['application/json'].schema).toBeDefined();

          if (method === 'post') {
            expect(operation.responses['400']).toBeDefined();
            const requestSchema = resolve(docs, operation.requestBody.content['application/json'].schema.$ref);
            expect(requestSchema.required.length).toBeGreaterThan(0);
            for (const field of requestSchema.required) {
              expect(requestSchema.properties[field]).toBeDefined();
            }
          }
        }

        // Reschedule takes a new time, a new inspector, or both.
        const reschedule = resolve(docs, docs.paths['/reschedule-inspection'].post.requestBody.content['application/json'].schema.$ref);
        expect(Object.keys(reschedule.properties).sort()).toEqual(['assignedToEmail', 'id', 'scheduledAt']);
        expect(reschedule.required).toEqual(['id']);

        // Cancel needs a reason, and a cancelled inspection carries when and why it was cancelled.
        const cancel = resolve(docs, docs.paths['/cancel-inspection'].post.requestBody.content['application/json'].schema.$ref);
        expect(cancel.required.sort()).toEqual(['id', 'reason']);
        expect(docs.components.schemas.Inspection.properties.cancelledAt).toBeDefined();
        expect(docs.components.schemas.Inspection.properties.cancellationReason).toBeDefined();

        // Each refusal is described: a completed inspection can be neither moved nor cancelled, and a
        // turnover has at most one open inspection.
        expect(docs.paths['/reschedule-inspection'].post.description).toMatch(/already completed/);
        expect(docs.paths['/cancel-inspection'].post.description).toMatch(/already completed/);
        expect(docs.paths['/schedule-inspection'].post.description).toMatch(/already has an open inspection/);
      });
    }
  );
});
