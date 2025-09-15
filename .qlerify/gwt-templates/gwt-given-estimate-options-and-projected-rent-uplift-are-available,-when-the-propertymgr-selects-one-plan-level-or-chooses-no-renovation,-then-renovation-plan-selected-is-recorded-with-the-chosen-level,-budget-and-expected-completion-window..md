You will receive:
- Current Given-When-Then Information (the single scenario to generate)
- Old Given-When-Then Information (for context)
- Example test code templates
- Swagger (OpenAPI 3.0.x) specification

## Rules
1. **The Golden Rule: OpenAPI is the ONLY Source of Truth for API Interaction**
   - All API endpoints, request/response bodies, JSON field names (e.g., `createdAt`), and data types used in the test code MUST come **exclusively** from the provided OpenAPI specification.
   - The Given-When-Then description is for defining the business logic and scenario ONLY. When writing the test code, **you MUST IGNORE the casing and exact wording from the GWT description for field names.** For example, if the GWT says "...with a 'Task' longer than...", the test code must use the field `task` as defined in the spec.

2. **File Generation**
   - Generate code **only for one Given-When-Then scenario** specified in "Current Given-When-Then Information".
   - Create two files: one `.feature` file and its corresponding `.test.js` file.
   - Name the files by combining the **event description** and the **GWT statement description** (e.g., `create-todo-given-no-todo-exists.test.js`).
   - Both files must be co-located in the `tests/` folder.
   - Do not generate, modify, or delete any other files.

3. **Feature File Content (.feature)**
   - The file must contain exactly one `Scenario`.
   - The scenario statement must match the **Given-When-Then statement exactly** from the context information—no paraphrasing.

4. **Test File Implementation (.test.js)**
   - **Dependencies & Setup:**
      - Use **jest-cucumber** and **supertest**.
      - Must be ES Modules (`import` syntax).
      - Use `import.meta.url` and `path.resolve()` to load the `.feature` file.
      - The Express app is assumed to be exported from `src/bootstrap/app.js`.
   - **Data Handling:**
      - When creating a new entity (e.g., in a "Given" step), never include the `id` field in the request payload. IDs are always assigned by the backend.
      - Never assume an entity exists unless explicitly stated in a "Given" step.
      - Always create required test data by making real API calls in the "Given" step definitions.
      - Never hardcode IDs. Always capture the ID from a creation response and reuse it in subsequent steps.
   - **Assertions:**
      - Tests must verify outcomes by asserting against real API responses (status codes and body content).
      - All assertions about the API response structure must also strictly match the OpenAPI specification.
   - **Date:**
      - The current date is **{{ CURRENT_DATE }}** and should be used where relevant.


## Output Format
Use the following structure exactly:

=== FILE: tests/path/to/file.ext ===  
=== TAG: gwt-<GWT_ID> ===
```javascript
<FILE CONTENT HERE>
```

## Formatting Requirements
- FILE and TAG labels must be ALL UPPERCASE, enclosed in triple equals (===).
- FILE = full path inside tests/, e.g. tests/create-todo-given-no-todo-exists.feature.
- TAG = gwt-<GWT_ID> where <GWT_ID> is from "Current Given-When-Then Information". Tag values must be ALL lowercase.
- Multiple tags may be chained with commas, but this prompt is for a single gwt.
- Output both the .feature file and its matching .test.js file.
- Output only new or modified files — do not include unchanged files.
- No explanations or comments — only file path, tag, and code block.
- Always wrap code in triple backticks and specify the language (javascript).

Code Template:  
{{ EXAMPLE_CODE }}

Old Given-When-Then Information:  
{{ LEGACY_INFO }}

Current Given-When-Then Information:  
{{ LATEST_INFO }}

OpenAPI Specification:  
{{ SWAGGER_DOCUMENT }}

## Your task
Generate the .feature file and its matching .test.js file for the single Given-When-Then scenario in Current Given-When-Then Information, following all rules above.

