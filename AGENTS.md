# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layouts, and styles (`globals.css`). Route groups like `(chat)` and API routes under `app/api/*`. Server actions live in `app/actions.ts`.
- `components/`: Shared React components (`.tsx`).
- `lib/`: Utilities, helpers, and service clients.
- `types/`: Shared TypeScript definitions.
- `public/`: Static assets served at the root path.
- `docs/`: Supplemental documentation.
- Root config: `next.config.js`, `tailwind.config.js`, `.eslintrc.json`, `prettier.config.cjs`, `tsconfig.json`, `middleware.ts`, `auth.ts`.

## Build, Test, and Development Commands
- `pnpm dev`: Start the dev server at `http://localhost:3000`.
- `pnpm build`: Production build.
- `pnpm start`: Run the built app.
- `pnpm preview`: Build then start (handy for smoke checks).
- `pnpm lint` / `pnpm lint:fix`: Lint TypeScript/React (Next + Tailwind rules).
- `pnpm type-check`: TypeScript check with `tsc --noEmit`.
- `pnpm format:write` / `pnpm format:check`: Apply or verify Prettier formatting.
Use `pnpm` (repo declares `packageManager: pnpm@8.x`).

## Coding Style & Naming Conventions
- TypeScript strict mode; path alias `@/*` (see `tsconfig.json`).
- Prettier: 2 spaces, no semicolons, single quotes, LF EOL, sorted imports (see `prettier.config.cjs`).
- ESLint: extends `next/core-web-vitals`, `prettier`, and Tailwind plugin. Prefer utility-first classes in `className`.
- Naming: components `PascalCase` in `components/`; hooks `useX`; helpers `camelCase`; route segments in `app/` are lowercase and descriptive. Use `.tsx` for components, `.ts` for utilities/types.

## Testing Guidelines
- No test runner is configured. Validate changes via `pnpm type-check`, linting, and local/manual QA.
- If adding tests, propose the approach in your PR. Prefer colocated files named `*.test.ts`/`*.test.tsx` and keep tooling lightweight.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc. Example: `feat(auth): add email link login`.
- PRs: include a clear description, linked issues, screenshots for UI changes, repro steps, and any env var notes. Keep PRs focused and small; update `docs/` when relevant.

## Security & Configuration
- Do not commit secrets. Configure local values in `.env.local`; use `.env.example` as a template. Rotate any leaked keys immediately.
- Document any new required env vars in the PR and `README.md`.

