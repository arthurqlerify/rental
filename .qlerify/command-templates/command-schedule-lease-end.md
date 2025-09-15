You will receive:
- Current folder structure and tech stacks
- Existing **command-related** code files (before changes)
- Current Command Information (the single command to generate)
- Old Command Information (for context)
- Swagger (OpenAPI 3.0.x) specification

## Rules
1. **The Golden Rule: OpenAPI is the ONLY Source of Truth for Code**
   - All request/response schemas, JSON field names (e.g. `createdAt`), data types, and required properties MUST come **exclusively** from the provided OpenAPI specification.
   - The `dataFields` arrays in "Current Command Information" and "Related Entity Information" are for high-level context ONLY. **You MUST IGNORE them when generating code.** Do not use "Created At" or "Product Name" in the code; use `createdAt` and `productName` as defined in the specification.

2. **Scope**
   - Generate code **only for one command** specified in the "Current Command Information".
   - Crucially, implement the business logic described in the `gwtDescriptions` array within the Command Information. This is the primary source for the command's behavior.
   - Do **not** generate, modify, or delete any unrelated files.
   - Do **not** touch entities, read models, queries, or any other domains.
   - Only files inside `src/domain/command` and `src/interfaces/http/controllers` may be updated or created.

3. **Strictness**
   - All request/response schemas, field names, data types, required properties, and descriptions must come **strictly from the provided OpenAPI Specification**.
   - The business logic, validations, and outcomes must come **strictly from the `gwtDescriptions`**.
   - Do not invent fields, structures, or logic not explicitly defined in the specification.
   - Do not invent logic not explicitly defined in the specification or the GWT descriptions.
   - Only implement logic for commands defined in the **paths** section with HTTP methods.
   - Use only status codes: **200** and **400**.

4. **Implementation**
   - Assume that Entity classes (e.g., `new Todo(...)`) expect objects whose property names and casing already match the OpenAPI specification's schemas. No mapping layer is needed between the controller's request body and the command/entity.
   - Database operations limited to: `insert`, `findAll`, `findById`, `update`, `remove`, `clear`.
   - For all database operations (e.g., `insert`, `findById`), the collection name (the first argument) **MUST** be the exact string from the `name` field of the associated entity, found in the "Related Entity Information" section.
   - Use `uuid` to generate IDs for Create operations.
   - Database updates must use the corresponding Entity class.
   - Delete operations must return the deleted item, not just a success message.
   - Controller must export both `routeBase` and `router`.
   - Do **not** use route parameters — all input must come from the request body.

## Output Format
Use the following structure exactly:

=== FILE: path/to/file.ext ===  
=== TAG: command-<COMMAND_ID> ===  
```javascript
<FILE CONTENT HERE>
```

## Formatting Requirements
- FILE and TAG labels must be ALL UPPERCASE, enclosed in triple equals (===).
- FILE = full path under src/, e.g. src/domain/command/CreateTodo.js.
- TAG = command-<COMMAND_ID> where <COMMAND_ID> is from "Current Command Information". Tag values must be ALL lowercase.
- Multiple tags may be chained with commas, but this prompt is for a single command.
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

Old Command Information:  
{{ LEGACY_INFO }}

Current Command Information:  
{{ LATEST_INFO }}

OpenAPI Specification:  
{{ SWAGGER_DOCUMENT }}

## Your task
Update or create only the files required for the single command in Current Command Information, incorporating the business logic from the GWT scenarios and following all rules above.

