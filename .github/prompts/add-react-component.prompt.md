---
description: "Add a new React component to a client package (budget, portfolio, rss-reader, web). Generates the component file with Panda CSS styling and a Vitest unit test."
argument-hint: "Component description (e.g., 'BudgetCard component in packages/client/budget showing amount and category')"
agent: "agent"
---

Add a new React component to the specified client package based on the description provided.

Generate all of the following:

1. **Component file** in `src/components/<ComponentName>.tsx`:
   - TypeScript props interface
   - Panda CSS styling via `css()` from `styled-system/css`
   - React 19 functional component
2. **Vitest test file** in `src/components/<ComponentName>.test.tsx`:
   - Render test with Testing Library
   - At least one interaction or state test
   - Query by accessible role where possible

Follow conventions in [client.instructions.md](../instructions/client.instructions.md):
- Use `css()` from `styled-system/css` for all styling
- 4-space indent, single quotes (Biome enforced)
- If the component needs form input, integrate React Hook Form + Zod
- If the component needs shared state, connect to the appropriate Zustand store
