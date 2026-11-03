import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import YAML from 'yamljs';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'api-docs-describe-the-rent-endpoints.feature'));

const RENT_COMMANDS = {
  '/issue-rent-charges': { request: 'IssueRentChargesRequest', required: ['month'] },
  '/record-rent-payment': { request: 'RecordRentPaymentRequest', required: ['leaseId', 'amount', 'paidOn', 'method'] },
  '/waive-rent-charge': { request: 'WaiveRentChargeRequest', required: ['id', 'reason'] },
};
const RENT_READS = ['/get-all-rent-charges', '/get-all-rent-payments', '/get-all-lease-balances', '/get-rent-summary'];

// Every '#/components/...' reference in the document.
const refsIn = (node) => {
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) => (key === '$ref' ? [value] : refsIn(value)));
};

const resolve = (docs, ref) => ref.replace('#/', '').split('/').reduce((node, key) => node?.[key], docs);

defineFeature(feature, test => {
  let docs;
  let docsPage;

  test(
    'Given the API docs served at /api/docs, When a developer looks up the rent endpoints, Then each one is described with its request and its response.',
    ({ given, when, then }) => {
      given('the API docs served at /api/docs', async () => {
        docsPage = await request(app).get('/api/docs/');
        expect(docsPage.statusCode).toBe(200);
      });

      when('a developer looks up the rent endpoints', async () => {
        docs = YAML.load(path.resolve(__dirname, '../src/docs/swagger.yaml'));
      });

      then('each one is described with its request and its response.', async () => {
        for (const [route, { request: requestSchema, required }] of Object.entries(RENT_COMMANDS)) {
          const operation = docs.paths[route]?.post;
          expect(operation).toBeDefined();
          expect(typeof operation.description).toBe('string');
          expect(operation.requestBody.content['application/json'].schema.$ref).toBe(`#/components/schemas/${requestSchema}`);
          expect(docs.components.schemas[requestSchema].required).toEqual(required);
          expect(operation.responses['200'].content['application/json'].schema).toBeDefined();
          expect(operation.responses['400']).toBeDefined();
        }

        for (const route of RENT_READS) {
          const operation = docs.paths[route]?.get;
          expect(operation).toBeDefined();
          expect(operation.parameters.length).toBeGreaterThan(0);
          expect(operation.responses['200'].content['application/json'].schema).toBeDefined();
        }

        expect(docs.components.schemas.RentPayment.properties.method.enum).toEqual(['BankTransfer', 'Card', 'Cash']);
        expect(docs.components.schemas.Lease.properties.startDate).toBeDefined();
        expect(docs.components.schemas.CreateLeaseRequest.properties.startDate).toBeDefined();

        const unresolved = refsIn(docs).filter((ref) => resolve(docs, ref) === undefined);
        expect(unresolved).toEqual([]);
      });
    }
  );
});
