# Project Guidelines

This is a private TypeScript monorepo (pnpm workspaces) for personal financial management tools.

## Repository Structure

```
packages/
  server/api/       — Express 5 REST API (@dskhys/api)
  client/budget/    — Budget management PWA (@dskhys/budget)
  client/portfolio/ — Stock portfolio manager (@dskhys/portfolio)
  client/rss-reader/— RSS reader PWA (@dskhys/rss-reader)
  client/web/       — Landing site (@dskhys/web)
  client/mf-scraper/— MoneyForward CLI scraper (@dskhys/mf-scraper)
```

## Tech Stack

### Common
- Language: TypeScript
- Linter/Formatter: Biome (4-space indent, single quotes)
- Package manager: pnpm 10

### Server (`packages/server/api`)
- Runtime: Node.js 24
- Framework: Express 5
- Database: SQLite3 (raw, no ORM)
- Validation: Zod 4
- Auth: JWT + bcrypt
- Error handling: neverthrow (Result type)
- Testing: Vitest + Supertest

### Client (`packages/client/*`)
- Framework: React 19 (with compiler)
- Build: Vite 7
- Styling: Panda CSS
- Routing: TanStack Router
- State: Zustand
- Forms: React Hook Form + Zod
- Testing: Vitest + Testing Library
- PWA: vite-plugin-pwa (offline support required)

### CLI (`packages/client/mf-scraper`)
- Automation: Playwright (Chromium)
- Distribution: npm global install

## Build & Test Commands

```bash
pnpm lint           # Biome check (all packages)
pnpm format         # Biome check --write (all packages)
pnpm test           # Run all tests
pnpm build          # Build all packages
pnpm check          # format + test + build

pnpm api <cmd>      # Run command in @dskhys/api
pnpm budget <cmd>   # Run command in @dskhys/budget
pnpm portfolio <cmd># Run command in @dskhys/portfolio
pnpm mf-scraper <cmd>
```

## Conventions

- Documentation: Markdown only (except API specs → OpenAPI YAML)
- Diagrams: Mermaid embedded in Markdown
- YAML file extension: must be `.yaml` (not `.yml`)
- Minimum dev environment: Docker + VS Code + Dev Containers extension

See [docs/guidelines/development-guidelines.md](../docs/guidelines/development-guidelines.md) for full development rules.
