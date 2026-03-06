# State Management Strategy

Professional SaaS applications treat the URL as the primary source of truth for UI state.

## 1. URL State (Persistence)
All filters, searches, and tab selections MUST be persisted in the URL.

**Implementation Pattern:**
```typescript
// useSearchParams for persistence
const [searchParams, setSearchParams] = useSearchParams();
const status = searchParams.get('status') || 'ALL';

const updateStatus = (newStatus: string) => {
  setSearchParams({ status: newStatus }, { replace: true });
};
```

## 2. Server State (TanStack Query)
Handle all remote data fetching and mutations via TanStack Query.

- **Caching:** Standardize on `staleTime: 5 * 60 * 1000` (5 minutes) for most domain data.
- **Prefetching:** Trigger `queryClient.prefetchQuery` on hover for list items to make navigation feel instantaneous.
- **Optimistic Updates:** Immediately update the cache on "Approve/Reject" actions to provide sub-second feedback.

## 3. Transient UI State
Use standard `useState` for local UI concerns (e.g., `isModalOpen`). Avoid using global stores (Redux/Zustand) unless the state is consumed by 3+ independent features.
