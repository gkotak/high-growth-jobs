# HighGrowthJobs High-Level Data Flow

This diagram illustrates the daily "Signal-to-Discovery" loop via our **Hexagonal Architecture**. It highlights how external ingestion adapters feed into the canonical HighGrowthJobs tracking core.

```mermaid
graph TD
    %% Inputs (System Adapters - S)
    subgraph Inbound_Ports [Inbound Ports - System Adapters]
        A1[Crunchbase CSV Loader] -->|Top 800 VCs| B
        A2[Crunchbase Company CSV Loader] -->|1,000+ PortCos| B
        A3[Axios Pro Rata Scraper] -->|Daily Funding Signals| B
    end

    %% Processing (The Opinionated Core)
    subgraph Core_Engine [The HighGrowthJobs Core]
        B{Ingestion Engine}
        B -->|Upsert VCFirms| B1[(VCFirm Table)]
        B -->|Upsert Companies| B2[(Company Table)]
        B -->|M:N Link| B3[(CompanyVCFirmLink)]
        
        %% Extraction Layers
        subgraph NLP_Parsers [AI Extraction Layer]
            A3 --> B4[LLM Parser: gpt-4o-mini]
            B4 -->|Structured Funding Rounds| B
        end
    end

    %% Next Stages
    subgraph Outbound_Discovery [MarketScraper]
        B2 -->|Fetch Un-Scraped PortCos| M1[Job Board Scraper]
        M1 -->|Playwright/Gemini Agent| M2[(Job Table)]
    end

    %% Human Review (The Opinionated Process - C)
    subgraph Workbench [GrowthUI Web Portal]
        WC[User] -->|Browser| UI[React Discovery Dashboard]
        UI -->|API Search Queries| B1
        UI -->|API Growth Filters| B2
        UI -->|API Job Views| M2
    end

    %% Network Connection
    subgraph Network_Intelligence [LinkedIn Connectivity]
        WC -->|OAuth Grant| L1[LinkedIn Adapter]
        L1 -->|Connections| L2[(UserConnection Table)]
        L2 -->|Fuzzy Match| B2
    end

    %% Styling
    style B fill:#f96,stroke:#333,stroke-width:4px
    style UI fill:#bbf,stroke:#333,stroke-width:2px
    style B4 fill:#bfb,stroke:#333,stroke-width:2px
    style M1 fill:#f6f,stroke:#333,stroke-width:2px
```

### Flow Description:
1.  **Seed Ingestion (S):** The platform initialization is achieved by the **Crunchbase CSV Loaders**, seamlessly seeding hundreds of top VCs and linking them to thousands of high-growth companies.
2.  **Daily Signal Ingestion (S):** Fast-moving updates (like new Series A rounds) are ingested by the **Axios Pro Rata Scraper** via headless HTTP/Markdown paths.
3.  **AI Extraction & Routing (Core):** 
    -   The `gpt-4o-mini` adapter ensures unstructured newsletter text becomes normalized database structures.
    -   The core performs aggressive upserts (merging existing DB entries, and handling missing VCFirms via the `is_stub=True` logic).
4.  **Job Scraping Loop (MarketScraper):** Once companies are canonicalized, the scraping service navigates their career pages to harvest active `Job` listings.
5.  **GrowthUI Discovery:** Users enter the system through the React frontend, querying the highly structured data by specific growth constraints ("Show me remote PM roles at Series A companies funded by Founders Fund").
6.  **Network Intelligence (Epic 5):** The user seamlessly connects their LinkedIn to find 1st-degree referrals inside the curated database.
