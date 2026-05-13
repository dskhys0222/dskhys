---
description: "Use when writing React components, hooks, pages, or client-side logic in packages/client. Covers Panda CSS styling, Zustand state management, TanStack Router, React Hook Form, and PWA offline considerations."
applyTo: "packages/client/**/*.{ts,tsx}"
---

# Client Development Guidelines

## Styling: Panda CSS

- Use `css()` or `cva()` from `styled-system/css` for styling — never inline styles or plain class names
- Run `pnpm <package> prepare` after modifying `panda.config.ts` to regenerate `styled-system/`
- Prefer semantic tokens and design tokens defined in `panda.config.ts` over hardcoded values

## State Management: Zustand

- Define stores in `src/stores/` with typed slices
- Keep server state (async data) out of Zustand — use component-local state or TanStack Query if needed
- Avoid storing derived data in stores; compute it in selectors or components

## Routing: TanStack Router

- Define routes as file-based routes under `src/routes/`
- Use `createFileRoute` for each route file
- Access route params with `useParams()` and search params with `useSearch()`
- Run `pnpm <package> dev` to trigger automatic route codegen via `@tanstack/router-plugin`

## Forms: React Hook Form + Zod

- Use `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })` for all forms
- Define Zod schemas alongside the form component or in `src/schemas/`
- Use `register`, `handleSubmit`, and `formState.errors` from `useForm`

## PWA & Offline

- All client apps must work offline; do not assume network availability
- Cache API responses in `vite-plugin-pwa` workbox config where appropriate
- Test offline behavior via DevTools → Network → Offline

## React 19

- Use React compiler optimizations — avoid unnecessary `useMemo`/`useCallback` unless profiler shows a regression
- Prefer Server Components patterns where applicable (future-proofing)
- Use `use()` hook for promise unwrapping where applicable
