# Software Architecture Patterns

HighGrowthJobs utilizes a **Hexagonal Architecture** to manage the complexity of diverse Customers, Markets, and Systems.

## 1. Ports & Adapters (Dependency Inversion)
- **Ports (Interfaces):** Defined in `app.interfaces`. These are abstract base classes or protocols describing *what* a system does (e.g., `IERPAdapter.get_invoice`).
- **Adapters (Implementations):** Defined in `app.adapters`. These are specific implementations (e.g., `BusinessCentralAdapter`, `MockERPAdapter`).
- **Rule:** Core business logic (in `app.modules`) must only import and depend on **Ports**. Implementation is injected at startup via a DI container.

## 2. Vertical Slices (Modularity)
Instead of generic `services/` or `controllers/` folders, the backend is organized into business slices:
- `app.modules.job-posts`: Lifecycle and data for individual deductions.
- `app.modules.reconciliation`: The Lumping Matcher and 3-way match math.
- `app.modules.artifacts`: File handling, OCR, and storage.

## 3. SOLID Principles
- **Single Responsibility:** Each class/module must have one reason to change.
- **Open/Closed:** The system should be open for expansion (new Market Playbooks) but closed for modification of the core HJGPlus logic.
- **Interface Segregation:** Clients should not be forced to depend on methods they do not use.
