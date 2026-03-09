# Logging Strategy & Architecture

HighGrowthJobs employs a centralized, dual-output logging system to ensure visibility in production (Railway/Vercel) while preventing local or container disk bloat.

## 1. Centralized Setup (`src/app/core/logging_setup.py`)

All logging across the application (background workers, scrapers, one-off scripts) is routed through our custom `setup_logger` utility. This utility configures the **Global Root Logger** to ensure that trace logs from deeply nested modules (e.g., `Orchestrator`, `MultipassScraperAdapter`) naturally inherit our unified output rules.

## 2. The Dual-Output Approach

Every time `logger.info()` or `logger.error()` is called, the output is dispatched to two handlers simultaneously:

### A. Standard Console Output (`StreamHandler`)
- **Behavior**: Streams directly to `stdout` / `stderr`.
- **Purpose**: This is what cloud providers (like Railway or Vercel) capture in real-time. It allows developers to view live streaming logs in the Railway Dashboard or Vercel logs viewer.
- **Retention**: Ephemeral (managed entirely by the cloud provider's retention policies).

### B. Truncating File Output (`RotatingFileHandler`)
- **Behavior**: Writes log entries to a local physical file.
- **Rule**: Max filesize is capped at **5 Megabytes (5MB)**.
- **Rotation**: Once the active log file exceeds 5MB, it is automatically archived (renamed to `.1`, `.2`, etc.), up to a maximum of 3 backup files. The oldest file is automatically deleted.
- **Purpose**: Provides a local, persistent history of background processes without filling up the server's disk space (Max disk usage is hard-capped at 15MB total).

## 3. Log Files & Destinations

| Log File Name | Context | Where it is found |
| :--- | :--- | :--- |
| `logs/janitor.log` | **Background Worker & Scraping Activity.** Contains all outputs from the `JanitorDaemon`, `JanitorService`, targeted manual scrapes (`scripts/scrape_company.py`), and test runs (`scripts/test_janitor.py`). | `logs/janitor.log` (Ignored in `.gitignore`) |
| `logs/app.log` | **Default Application Logs.** Any other core system component that explicitly initializes a logger without overriding the default file destination. | `logs/app.log` (Ignored by `logs/` global rule) |

## 4. Log Levels & Usage Standard

- **`[INFO]`**: The "Happy Path". Used to trace execution flow, such as when the scraper moves from Level 1 to Level 2 (`"Using Multipass..."`), or when an optimization condition is met (`"⏭️ Smart Skip: Content hash matches"`).
- **`[WARNING]`**: Used for non-fatal anomalies. Examples: a company has no website URL defined in the database, or an LLM extraction returned 0 jobs despite a successful full page load.
- **`[ERROR]`**: Used for handled exceptions and critical failures. Examples: `httpx` timeouts, Playwright browser crashes, or Database constraint violations. The system is designed to catch these, log the error clearly, and gracefully continue to the next item instead of crashing the daemon.
