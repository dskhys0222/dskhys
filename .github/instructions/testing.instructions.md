---
description: "Use when writing, reviewing, or improving tests. Covers Vitest unit/integration test patterns, Supertest API tests for Express routes, and Testing Library patterns for React components."
applyTo: "**/*.{test,spec}.ts"
---

# Testing Guidelines

## Vitest Conventions

- Use `describe` / `it` / `expect` — prefer `it` over `test` for readability
- Name tests with the pattern: `it('should <behavior> when <condition>')`
- Group related tests with `describe('<unit name>')`
- Use `vi.fn()` for mocks, `vi.spyOn()` for spies, `vi.mock()` for module mocks
- Reset mocks between tests with `beforeEach(() => vi.clearAllMocks())`

## API Tests: Supertest

- Use `supertest(app)` — import the Express app without calling `.listen()`
- Test the full request/response cycle: status code, body shape, and headers
- Seed test data in `beforeEach` and clean up in `afterEach` using an in-memory or temp DB
- Example:
  ```ts
  it('should return 201 when creating a valid resource', async () => {
      const res = await request(app)
          .post('/api/resource')
          .send({ name: 'test' })
          .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ name: 'test' });
  });
  ```

## React Component Tests: Testing Library

- Import from `@testing-library/react`: `render`, `screen`, `fireEvent`, `waitFor`
- Query by accessible role first: `screen.getByRole('button', { name: /submit/i })`
- Avoid querying by `data-testid` unless no accessible alternative exists
- Wrap async interactions in `waitFor` or use `findBy*` queries
- Example:
  ```ts
  it('should display error when form is submitted empty', async () => {
      render(<MyForm />);
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });
  ```

## Coverage

- Run with `vitest run --coverage` to generate v8 coverage
- Focus coverage on business logic in `src/repository/`, `src/schemas/`, and `src/utils/`
