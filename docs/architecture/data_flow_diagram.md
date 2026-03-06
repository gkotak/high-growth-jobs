# HighGrowthJobs High-Level Data Flow

This diagram illustrates the "Email-to-Action" loop via our **Hexagonal Architecture**. It highlights how flexible System Adapters feed into the rigid, Opinionated Core.

```mermaid
graph TD
    %% Inputs (System Adapters - S)
    subgraph Inbound_Ports [Inbound Ports - System Adapters]
        A1[Outlook Adapter: Remittances] -->|Trigger| B
        A2[Outlook Adapter: Buyer Approvals] -->|Unstructured Text| B
        A3[3PL Portal Adapter: BOLs] -->|PDF Artifacts| B
    end

    %% ERP Context
    subgraph ERP_Adapter [ERP Adapter - S]
        C[Business Central Adapter] <-->|Fetch: Invoices/POs| B
    end

    %% Processing (The Core & Playbooks)
    subgraph Core_Engine [The Opinionated Core]
        B{Canonical Engine}
        B --> B1[Deterministic: Lumping Matcher]
        B --> B2[Deterministic: 3-Way Match]
        B --> B3[AI: Dispute Drafter]
        
        %% Market Rules
        subgraph Market_Playbooks [Market Playbooks - R]
            B --> B4[Dollar General Playbook]
            B --> B5[Walmart Playbook]
        end
    end

    %% Continuity (Orchestration)
    subgraph Continuity [Continuity Engine]
        O[HJGPlus Orchestrator] -->|Dual-Speed: Accelerator + Janitor| B
        O -->|Monitor & Retry| E
    end

    %% Human Review (The Opinionated Process - C)
    subgraph Workbench [Audit Workbench UI]
        B1 & B2 & B3 --> D[Investigation Workbench]
        D -->|Human Action: Approve/Tag| E[Decision Engine]
    end

    %% Actions & Feedback Loop
    subgraph Outbound_Ports [Outbound Ports - Adapters]
        E -->|Submit via Playbook| F[Email Adapter: Sent Dispute]
        E -->|Submit via Playbook| G[API Adapter: Portal Submission]
        E -->|Gather Evidence| K[Email Adapter: 3PL Inquiry]
        
        %% The Feedback Loop
        F & G --> H{Market Response}
        H -->|Approved Wait for R1| I[Status: RECONCILIATION PENDING]
        H -->|Rejected| J[Status: REJECTED]
        H -->|Request More Info| D
        
        %% 3PL Loop
        K -->|New BOL/Proof| B
    end

    %% Final Settlement
    subgraph Settlement [ERP Settlement]
        I --> L[ERP Adapter: Apply Credit Memo]
        J --> M[ERP Adapter: Write-off / Journal Entry]
    end

    %% Styling
    style B fill:#f96,stroke:#333,stroke-width:4px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
    style H fill:#f6f,stroke:#333,stroke-width:2px
```

### Flow Description:
1.  **Ingestion (S):** The process is triggered via the **Outlook Adapter** capturing a remittance ZIP or deduction email.
2.  **Contextualization (S):** The core requests Invoice/PO data through the **Business Central Adapter**.
3.  **Intelligence & Playbooks (Core + R):** 
    -   The core extracts canonical data using AI.
    -   The **Deterministic Math Engine** runs the Lumping Matcher.
    -   The specific **Market Playbook** (e.g., DG) dictates what evidence is required and how the dispute should be drafted.
4.  **Inquiry Loop:** If a BOL is missing, an adapter fetches it from the 3PL portal or emails the 3PL.
5.  **Verification (The Rigid 'C'):** The **Audit Workbench** presents the unified view. The human is forced to use our UI to hit "Approve," rejecting complex offline routing.
6.  **Resolution:** 
    -   **Won:** Awaits the "R1" code, then updates the ledger via the ERP Adapter.
    -   **Rejected:** Results in a final **Write-off** via the ERP Adapter.
