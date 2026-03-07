# Epic 5: Network Intelligence (LinkedIn Integration)

## 1. Overview
Finding high-growth companies is only half the battle. Reaching the right people inside them dramatically increases interview conversion rates. This epic aims to map the user’s personal and professional network against the HighGrowthJobs database of active signals.

## 2. Objectives
- Automatically ingest the user's LinkedIn connections.
- Match connections to the normalized Company entities in our database.
- Present "warm introduction" indicators alongside job postings or company profiles.

## 3. Scope & Requirements
- **Authentication:** OAuth 2.0 flow with LinkedIn, strictly requesting only the read-level connection data.
- **Ingestion Pipeline:** Background worker that regularly updates the user's connection list. 
- **Matching Engine:** Fuzzy matching between the `Company` names extracted from LinkedIn connection profiles and our `Company` table.
- **UI Surface:** An internal networking view and specific tags on company cards showing "1st Degree Connections: 3".

## 4. Key Performance Indicators
- Match success rate between LinkedIn company strings and HighGrowthJobs database.
- Refresh latency (time taken to sync 1,000+ connections).
- API token refresh stability and error rates.

## 5. Technical Constraints
- LinkedIn API quotas are notoriously restrictive. The system must implement aggressive caching and backoff patterns.
- Connection data is PII (Personally Identifiable Information) and must be scoped solely to the `Tenant`/User level.
- Must avoid overloading the frontend connection.
