# CLAUDE.md

This file guides Claude Code when it works in this repository.

## What this is

A rental property app: properties, apartments, leases, turnovers (an apartment made ready again after a tenant
leaves), inspections, renovation cases and work orders. It was generated from a domain model, so every command and its
tests follow the model's Given/When/Then scenarios.

- `server/` is an Express 5 API in plain JavaScript with ES modules. It listens on port 3000.
- `client/` is a Vite, React and TypeScript app with shadcn/ui, Tailwind, TanStack Query, react-hook-form and zod. It
  listens on port 5000.

## Running it

```bash
cd server && npm install && npm start    # data in memory; DB_TYPE=sqlite or mongo and DB_URI in server/.env keep it
cd client && npm install && npm run dev  # http://localhost:5000
```

`client/src/lib/api.ts` points the client at the deployed server (`https://rental-app-ubtc.onrender.com/api/v1`).
Setting it to `"/api/v1"` uses a local server instead, since Vite forwards that path to port 3000. Leave it as it is
unless a card asks for the change.

## Checks

Run each from its folder.

- Client: `cd client && npx tsc --noEmit -p tsconfig.app.json` and `cd client && npm run build`. Both must pass.
- Server: `cd server && npm test` (Jest with jest-cucumber). Some of these tests already fail before any change. The
  tests for what you change must pass, and no test that passed before may fail.
- `cd client && npm run lint` already reports errors. Add no new ones.

## Server

A command lives in four places, and a new or changed command usually touches each of them:

- `server/src/domain/command/<Name>Command.js` has `static async execute(input)`. It checks the Given, writes, and
  returns the result. A broken rule is an `Error` it throws.
- `server/src/interfaces/http/controllers/<Name>Controller.js` exports an Express router and its `routeBase`
  (`/create-lease`). It checks the required fields and answers 200 with the result, or 400 with `{ message }` when the
  command throws.
  Every controller in that folder is mounted under `/api/v1` by `server/src/routes/index.js`, so there is no route list
  to edit.
- `server/src/domain/entity/<Entity>.js` lists the fields in its constructor and in `toJSON()`. A new field goes in
  both.
- `server/src/docs/swagger.yaml` describes the API, served at `/api/docs`. Keep it in step with the controllers.

Reads are in `server/src/domain/readmodel/` (`GetAll<Entities>ReadModel.js`, `Get<Entity>ByIdReadModel.js`).

Storage goes through `server/src/infrastructure/db/index.js` only: `insert`, `findAll`, `findById`, `update` and
`remove`, by collection name, which is the entity name (`'Lease'`). The memory, SQLite and Mongo adapters sit behind
it. Never import an adapter directly.

Tests sit in `server/tests/`, two files per scenario. `<scenario>.feature` holds the Given/When/Then, and
`<scenario>.test.js` runs it with jest-cucumber and supertest against the app. The step text in the test must match the
feature file word for word.

## Client

- `client/src/pages/` has one page per entity. Routes are in `client/src/App.tsx`, the menu in
  `client/src/components/shared/SidebarNav.tsx`.
- `client/src/features/<area>/` holds each area's forms and lists (`lease-management/CreateLeaseForm.tsx`).
- `client/src/api/<entity>.ts` holds the TanStack Query hooks that call the server through `client/src/lib/api.ts`.
- `client/src/lib/validators.ts` holds the zod schemas and the types taken from them.
- `client/src/components/ui/` is generated shadcn/ui. Use its components, do not edit them.
- Imports that leave the current folder use the `@/` alias for `client/src`.

Match the style of the file you edit.
