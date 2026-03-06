# Feature-Sliced Design (FSD) Reference

This structure ensures that the platform remains modular as we add new markets or audit types.

## Directory Structure

```text
src/
├── app/                # Global providers (Auth, QueryClient), routing, and styles
├── assets/             # Global images, SVGs, brand assets
├── components/         # Shared UI primitives (shadcn/ui, Layout components)
├── features/           # VERTICAL SLICES (Self-contained business modules)
│   ├── [feature-name]/ 
│   │   ├── components/ # Feature-specific UI (MatchRow, Timeline)
│   │   ├── hooks/      # Feature-specific logic (useJobPost, useApprove)
│   │   ├── services/   # Feature-specific API calls (api.getJobPost)
│   │   ├── types/      # Feature-specific interfaces
│   │   └── index.ts    # PUBLIC API (Exposes only necessary pieces)
├── hooks/              # Truly global utility hooks (useDebounce)
├── layouts/            # Page shells (DashboardLayout)
├── lib/                # Third-party configurations (axios.ts, query-client.ts)
├── pages/              # Route entry points (Composes features into views)
├── types/              # Global domain types & API response wrappers
└── utils/              # Pure utility functions (formatting, validation)
```

## The "Barrel" Rule
To maintain strict boundaries, components outside a feature should NEVER import from its deep sub-folders.

- **Good:** `import { InvestigationWorkbench } from '@/features/job-posts'`
- **Bad:** `import { MatchRow } from '@/features/job-posts/components/MatchRow'`

## Absolute Imports
Always use `@/` prefix mapped to `src/` to prevent brittle relative paths (`../../../`).
