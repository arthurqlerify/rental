You will receive:
- Current folder structure and tech stacks
- Existing **read model-related** code files (before changes)
- Current ReadModel Information (the single read model to generate)
- Old ReadModel Information (for context)
- Swagger (OpenAPI 3.0.x) specification

## Rules
1. **The Golden Rule: OpenAPI is the ONLY Source of Truth for Code**
   - All request/response schemas, JSON field names (e.g. `createdAt`), data types, and route paths MUST come **exclusively** from the provided OpenAPI specification.
   - The `dataFields` arrays are for high-level context ONLY. **You MUST IGNORE them when generating code.** Use `createdAt`, not "Created At", as defined in the spec.

2. **Scope & Business Logic**
   - Generate code **only for one read model** specified in the "Current ReadModel Information".
   - Crucially, the business logic for the query (filtering, sorting, data shaping) MUST be derived from the natural language requirements provided in the `allDescriptions` array.
   - **Conflict Resolution:** If the descriptions in `allDescriptions` are contradictory, you must synthesize a single, coherent rule. Prioritize the most specific or logical requirement to resolve the conflict.
   - Do **not** generate unrelated files or touch other domains like commands or entities.
   - Only files inside `src/domain/readmodel` and `src/interfaces/http/controllers` may be updated or created.

3. **Strictness**
   - The query logic, including any specific data filtering or transformations, must come **strictly from the `allDescriptions` array**.
   - Do not invent logic not explicitly defined in the specification or the provided descriptions.
   - Only implement logic for read models defined in the **paths** section with HTTP methods.
   - Use only status codes: **200** and **400**.

4. **Implementation**
   - Use the `dataFields` marked with `type: 'filter'` to construct the route's path parameters. Use the logic from `allDescriptions` to implement the filtering within the function body.
   - Assume the data structure of objects returned from the database already matches the OpenAPI schema.
   - Database operations are limited to: `insert`, `findAll`, `findById`, `update`, `remove`.
   - For all database operations (e.g., `findAll`, `findById`), the collection name (the first argument) **MUST** be the exact string from the `name` field of the associated entity, found in the "Related Entity Information" section.
   - Controller must export both `routeBase` and `router`.
   - Route must match the read model name in **lowercase kebab-case** (e.g. `/get-all-todos`).
   - Do **not** use query parameters — all inputs must come from the path parameters.

5. **Tagging**
   - The `TAG` line for each generated file **MUST** contain a `readmodel-<ID>` tag for **every ID** present in the `allIds` array of the "Current ReadModel Information".
   - All tags must be comma-separated. For example: `readmodel-abc-123, readmodel-def-456`.

## Output Format
Use the following structure exactly:

=== FILE: path/to/file.ext ===  
=== TAG: readmodel-<READMODEL_ID> ===
```javascript
<FILE CONTENT HERE>
```

## Formatting Requirements
- FILE and TAG labels must be ALL UPPERCASE, enclosed in triple equals (===).
- FILE = full path under src/, e.g. `src/domain/readmodel/GetAllTodos.js`.
- TAG = A comma-separated list of tags, one for each ID in the `allIds` array, following the format `readmodel-<ID>`. Tag values must be ALL lowercase
- For deleted files, append (deleted) to the file path.
- Output only new or modified files — do not include unchanged files.
- Do not include explanations or comments — only file path, tag, and code block.
- Always wrap code in triple backticks and specify the language (```javascript).

Tech Stacks:  
{{ TECH_STACKS }}

Folder Structure:  
{{ FOLDER_STRUCTURE }}

Route Code:  
=== FILE: root/src/routes/index.js ===
```javascript
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const controllersPath = path.join(__dirname, '../interfaces/http/controllers');

const files = fs.readdirSync(controllersPath);

for (const file of files) {
  if (!file.endsWith('.js')) continue;

  const modulePath = pathToFileURL(path.join(controllersPath, file)).href;
  const controller = await import(modulePath);

  if (controller.default?.router && controller.default?.routeBase) {
    router.use(controller.default.routeBase, controller.default.router);
  }
}

export default router;
```

Database Operations:  
{{ DATABASE_OPERATIONS }}

Example Code:  
{{ EXAMPLE_CODE }}

Old Files:  
{{ ORIGINAL_FILES }}

Old ReadModel Information:  
{{ LEGACY_INFO }}

Current ReadModel Information:  
{{ LATEST_INFO }}

OpenAPI Specification:  
{{ SWAGGER_DOCUMENT }}

## Your task
Update or create only the files required for the single read model, incorporating the business logic from `allDescriptions` and applying the multi-ID tagging rule from `allIds`, following all rules above.

