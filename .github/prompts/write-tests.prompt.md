---
description: "Write Vitest tests for the selected or specified code. Detects whether the target is an API route (Supertest), React component (Testing Library), or pure function (Vitest)."
argument-hint: "File or function to test (optional — defaults to active editor selection)"
agent: "agent"
---

Write comprehensive Vitest tests for the provided code.

1. Identify the type of code being tested:
   - **Express route** → use Supertest patterns
   - **React component** → use Testing Library patterns
   - **Pure function / utility / repository** → use Vitest with `describe`/`it`/`expect`

2. Cover:
   - Happy path (expected behavior)
   - Edge cases (empty input, boundary values)
   - Error/failure paths (invalid input, rejected promises)
   - Auth failure (401) for protected routes

3. Follow conventions in [testing.instructions.md](../instructions/testing.instructions.md):
   - Name tests: `it('should <behavior> when <condition>')`
   - Use `vi.fn()` / `vi.mock()` for dependencies
   - Reset mocks in `beforeEach(() => vi.clearAllMocks())`
   - Query by accessible role in UI tests

Place the test file adjacent to the source file as `<filename>.test.ts` or `<filename>.test.tsx`.
