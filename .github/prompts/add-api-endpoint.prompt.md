---
description: "Add a new REST API endpoint to packages/server/api. Generates the Express route handler, Zod schema, repository function, and Supertest tests."
argument-hint: "Endpoint description (e.g., 'POST /api/budgets - create a new budget entry')"
agent: "agent"
---

Add a new REST API endpoint to `packages/server/api` based on the description provided.

Generate all of the following files/additions:

1. **Zod schema** in `src/schemas/` — define request body and response shape
2. **Repository function** in `src/repository/` — parameterized SQLite3 query returning `Result<T, E>` via neverthrow
3. **Express route handler** in `src/routes/` — validate with `safeParse`, call repository, return JSON
4. **Register the router** in `src/index.ts` if it's a new router file
5. **Supertest test** — test happy path (201/200), validation failure (400), and auth failure (401) if applicable

Follow conventions in [server.instructions.md](../instructions/server.instructions.md):
- Use parameterized SQL (never interpolate user input)
- Use `safeParse` for Zod validation
- Return `{ data: ... }` for success, `{ error: string }` for errors
- Use neverthrow `Result<T, E>` in repository layer
