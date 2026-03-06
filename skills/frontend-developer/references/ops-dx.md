# Operational Excellence & Developer Experience (DX)

## 1. Observability (Traceability)
Correlate issues across the network gap to reduce MTTD (Mean Time to Detect).

- **Trace IDs:** Every frontend request should include an `X-Request-ID`. Capture this ID in frontend error boundaries.
- **Log Correlation:** Ensure that Sentry errors include the Request ID so backend engineers can find the exact corresponding logs in one click.

## 2. DX as a Force Multiplier
A Staff Engineer's primary output is the **productivity of the team**.

- **Scaffolding:** Automate the creation of new features (FSD folders, index.ts, standard hooks).
- **Documentation:** Maintain high-signal architectural ADRs (Architectural Decision Records) for frontend choices.
- **Build Performance:** Monitor and optimize Vite/CI build times to ensure the feedback loop stays under 5 minutes.
