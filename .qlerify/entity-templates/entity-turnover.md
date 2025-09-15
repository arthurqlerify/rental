You will receive:
- Current folder structure and tech stacks
- Existing **entity-related** code files (before changes)
- Current Entity Information (the single entity to generate)
- Old Entity Information (for context)
- Swagger (OpenAPI 3.0.x) specification

## Rules
1. **The Golden Rule: OpenAPI is the ONLY Source of Truth for Code**
   - The entity's properties, constructor parameters, and method signatures MUST come **exclusively** from the corresponding schema in the provided OpenAPI specification.
   - The `dataFields` array in "Current Entity Information" is for high-level context ONLY. **You MUST IGNORE it when generating code.** Do not use "Created At" or "Product Name" in the code; use `createdAt` and `productName` as defined in the specification.

2. **Scope**
   - Generate code for **one entity only**, as specified in "Current Entity Information".
   - Implement only the entity's data structure and essential logic (like an `update` method if applicable).
   - Do **not** generate commands, controllers, or read models.
   - The entity file must be located in `src/domain/entity`.

3. **Strictness**
   - Do not invent any properties, methods, or logic not directly implied by the OpenAPI schema and the provided example code.
   - Entities must be self-contained and must not import from other domains.
   - Do not output unchanged files.

4. **Implementation**
   - If the primary key of the entity is not named as `id` in the specification, then the generated entity MUST have an internal `id` property used for database operations (db.findById, db.update). This id should be a UUID and is a persistence-layer detail.
   - The internal id MAY NOT be part of the OpenAPI specification.
   - Use `uuid` for generating IDs in the constructor for new entities.
   - The entity class should represent the state and behavior of a single domain object.

## Output Format
Use the following structure exactly:

=== FILE: path/to/file.ext ===  
=== TAG: entity-<ENTITY_ID> ===
```javascript
<FILE CONTENT HERE>
```

## Formatting Requirements
- FILE and TAG labels must be ALL UPPERCASE, enclosed in triple equals (===).
- FILE = full path under src/, e.g. src/domain/entity/Todo.js.
- TAG = entity-<ENTITY_ID> where <ENTITY_ID> is from "Current Entity Information". Tag values must be ALL lowercase.
- Multiple tags may be chained with commas, but this prompt is for a single entity.
- For deleted files, append (deleted) to the file path.
- Output only new or modified files — do not include unchanged files.
- Do not include explanations or comments — only file path, tag, and code block.
- Always wrap code in triple backticks and specify the language (```javascript).

Tech Stacks:  
{{ TECH_STACKS }}

Folder Structure:  
{{ FOLDER_STRUCTURE }}

Database Operations:  
{{ DATABASE_OPERATIONS }}

Example Code:  
{{ EXAMPLE_CODE }}

Old Files:  
{{ ORIGINAL_FILES }}

Old Entity Information:  
{{ LEGACY_INFO }}

Current Entity Information:  
{{ LATEST_INFO }}

OpenAPI Specification:  
{{ SWAGGER_DOCUMENT }}

## Your task
Update or create only the files required for the single entity in Current Entity Information, following all rules above.

