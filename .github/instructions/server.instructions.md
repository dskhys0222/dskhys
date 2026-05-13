---
description: "Use when writing server-side code in packages/server/api. Covers Express 5 routing, SQLite3 raw queries, Zod 4 validation, JWT authentication, bcrypt, and neverthrow Result type error handling."
applyTo: "packages/server/api/src/**/*.ts"
---

# Server Development Guidelines

## Express 5 Routing

- Define routes in `src/routes/` — one file per resource (e.g., `auth.ts`, `budgets.ts`)
- Register routers in `src/index.ts` with a prefix: `app.use('/api/auth', authRouter)`
- Use `async`/`await` in route handlers — Express 5 catches async errors automatically
- Return consistent JSON response shapes: `{ data: ... }` for success, `{ error: string }` for errors

## Database: SQLite3 (raw)

- Access the singleton database instance via `getDatabase()` from `src/database/db-instance.ts`
- Use parameterized queries exclusively — never interpolate user input into SQL strings
- Wrap DB calls in repository functions in `src/repository/` — keep SQL out of route handlers
- Use `db.run()` for mutations, `db.get()` for single row, `db.all()` for multiple rows

## Validation: Zod 4

- Define schemas in `src/schemas/` and reuse across routes and repositories
- Validate request bodies with `schema.safeParse(req.body)` — use `safeParse`, not `parse`
- Return 400 with `error.flatten()` output on validation failure

## Error Handling: neverthrow

- Use `Result<T, E>` from `neverthrow` for functions that can fail (repository layer, business logic)
- Unwrap Results in route handlers: `if (result.isErr()) return res.status(500).json(...)`
- Avoid throwing errors in repository or service layers — return `err(...)` instead

## Authentication: JWT + bcrypt

- Protect routes with the `authenticate` middleware from `src/middleware/`
- Hash passwords with `bcrypt.hash(password, 12)` — never store plaintext
- Sign JWTs with the secret from environment variables — never hardcode secrets
- Access authenticated user as `req.user` (typed via Express type augmentation)

## Project Structure Conventions

```
src/
  database/    — DB singleton and schema init
  middleware/  — Express middleware (auth, error handling)
  repository/  — Data access functions returning Result<T, E>
  routes/      — Express routers
  schemas/     — Zod schemas
  utils/       — Pure utility functions
```
