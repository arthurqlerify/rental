import path from 'path';
import { fileURLToPath } from 'url';
import { loadFeature, defineFeature } from 'jest-cucumber';
import request from 'supertest';
import app from '../src/bootstrap/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feature = loadFeature(path.resolve(__dirname, 'create-property-given-no-property-exists-at-specified-address.feature'));

defineFeature(feature, test => {
  let createPropertyPayload;
  let createPropertyResponse;
  let propertyId;

  const PROPERTY_NAME = "Test Property Alpha";
  const PROPERTY_ADDRESS = "101 Test Street";
  const MANAGER_NAME = "John Doe";
  const MANAGER_EMAIL = "john.doe@example.com";
  const UNITS_COUNT = "50";

  test(
    'Given no property exists at the specified address and the PropertyMgr provides name, address, managerName, managerEmail and a positive unitsCount, When the PropertyMgr submits Create Property, Then Property Created is recorded with a new propertyId and the provided details, and the property becomes available to create apartments under it.',
    ({ given, when, then }) => {
      given('no property exists at the specified address and the PropertyMgr provides name, address, managerName, managerEmail and a positive unitsCount', () => {
        createPropertyPayload = {
          name: PROPERTY_NAME,
          address: PROPERTY_ADDRESS,
          managerName: MANAGER_NAME,
          managerEmail: MANAGER_EMAIL,
          unitsCount: UNITS_COUNT,
        };