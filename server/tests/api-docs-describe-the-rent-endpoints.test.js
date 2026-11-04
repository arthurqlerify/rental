import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import YAML from 'yamljs';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'api-docs-describe-the-rent-endpoints.feature'));

const controllersPath = path.resolve(__dirname, '../src/interfaces/http/controllers');

// The query parameters each rent read takes, as its read model handles them.
const READ_FILTERS = {
  '/get-all-rent-charges': ['propertyId', 'leaseId', 'asOf'],
  '/get-all-rent-payments': ['propertyId', 'leaseId'],
  '/get-all-lease-balances': ['propertyId', 'leaseId', 'asOf'],
  '/get-rent-summary': ['asOf'],
};

const resolve = (docs, ref) => ref.replace('#/', '').split('/').reduce((node, key) => node?.[key], docs);

// Every '#/components/...' reference in the document.
const refsIn = (node) => {
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) => (key === '$ref' ? [value] : refsIn(value)));
};

defineFeature(feature, test => {
  let rentEndpoints;
  let docsPageResponse;
  let docs;

  test(
    'Given the rent endpoints the API serves, When a developer opens the API docs at /api/docs, Then each rent endpoint is described with its request, its responses and its filters.',
    ({ given, when, then }) => {
      given('the rent endpoints the API serves', async () => {
        // Read from the controllers themselves, so a rent endpoint added later without docs fails here.
        rentEndpoints = [];
        for (const file of fs.readdirSync(controllersPath).filter((f) => /Rent|LeaseBalances/.test(f))) {
          const controller = (await import(pathToFileURL(path.join(controllersPath, file)).href)).default;
          for (const layer of controller.router.stack) {
            for (const method of Object.keys(layer.route.methods)) {
              rentEndpoints.push({ route: controller.routeBase, method });
            }
          }
        }
        expect(rentEndpoints.map((e) => e.route).sort()).toEqual([
          '/charge-rent',
          '/get-all-lease-balances',
          '/get-all-rent-charges',
          '/get-all-rent-payments',
          '/get-rent-summary',
          '/issue-monthly-rent-charges',
          '/record-rent-payment',
          '/waive-rent-charge',
        ]);
      });

      when('a developer opens the API docs at /api/docs', async () => {
        docsPageResponse = await request(app).get('/api/docs/');
        docs = YAML.load(path.resolve(__dirname, '../src/docs/swagger.yaml'));
      });

      then('each rent endpoint is described with its request, its responses and its filters.', async () => {
        expect(docsPageResponse.statusCode).toBe(200);

        for (const { route, method } of rentEndpoints) {
          const operation = docs.paths[route]?.[method];
          expect({ route, method, documented: Boolean(operation) }).toEqual({ route, method, documented: true });
          expect(typeof operation.description).toBe('string');
          expect(operation.responses['200'].content['application/json'].schema).toBeDefined();
          expect(operation.responses['400']).toBeDefined();

          if (method === 'post') {
            const requestSchema = resolve(docs, operation.requestBody.content['application/json'].schema.$ref);
            expect(requestSchema.required.length).toBeGreaterThan(0);
            for (const field of requestSchema.required) {
              expect(requestSchema.properties[field]).toBeDefined();
            }
          } else {
            const parameterNames = operation.parameters
              .map((parameter) => (parameter.$ref ? resolve(docs, parameter.$ref) : parameter))
              .map((parameter) => parameter.name);
            expect({ route, parameters: parameterNames.sort() }).toEqual({ route, parameters: [...READ_FILTERS[route]].sort() });
          }
        }

        expect(docs.components.schemas.RecordRentPaymentRequest.properties.method.enum).toEqual(['Bank transfer', 'Card', 'Cash']);

        const unresolved = refsIn(docs).filter((ref) => resolve(docs, ref) === undefined);
        expect(unresolved).toEqual([]);
      });
    }
  );
});
