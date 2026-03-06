# Performance & UX Scaling

Building for high-volume financial data requires virtualization and resilient UI patterns.

## 1. Virtualization (TanStack Virtual)
Any list or table that can exceed 50 items MUST be virtualized to maintain 60 FPS scrolling.

**Key Rule:** Offload the rendering burden to the browser's viewport. Ensure table headers remain sticky while the body scrolls.

## 2. Skeleton Strategy
Users judge speed by "Time to First Meaningful Paint."

- **Pattern:** Every feature MUST export a `Skeleton` version of its primary view (e.g., `JobPostDetailSkeleton`).
- **Usage:** Display the skeleton during the `isLoading` state of TanStack Query. Avoid generic full-page spinners.

## 3. Error Containment (Boundaries)
A failure in a side-panel (e.g., "Slack History") should not prevent the user from approving a job-post.

- **Requirement:** Wrap each feature in a React Error Boundary.
- **Feedback:** Provide a localized "Try Again" button within the failed component area.

## 4. Perceived Performance
- **Optimistic UI:** Always update the UI state before the server responds for critical actions (Submit, Approve, Save).
- **Prefetching:** Always prefetch detail views on list-item hover.
