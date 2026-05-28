# Full-Stack CRUD Application & CD Pipeline

A robust, three-tier CRUD application engineered with a deployment pipeline modeled strictly on Dave Farley's Continuous Delivery methodology. Every commit creates a unique "Release Candidate" validated through a highly optimized, deterministic feedback loop.

---

## Architecture Stack

The application is structured as a decoupled, three-tier architecture where each layer can be scaled and deployed independently:

*   **Frontend (Web UI):** A single-page application (SPA) serving the CRUD interface.
*   **Backend (Logic API):** A stateless RESTful API handling business rules, validation, and data orchestration.
*   **Database:** A relational data store utilizing automated, state-based, version-controlled schema migrations.

---

## The Continuous Delivery Pipeline

Following CD core principles, our pipeline acts as the ultimate gatekeeper for production quality. It treats software compilation and testing as completely separate responsibilities to maximize feedback speed.

### Core Pipeline Axioms
1. **Build Only Once:** Code is compiled, tested, and packaged into standard Docker containers *exclusively* in the Commit Stage. Downstream environments pull these exact, un-mutated images. We **never** rebuild code from source later in the pipeline.
2. **Stop the Line:** If any stage of the pipeline fails, the build is broken. Fixing the pipeline is the team's highest and immediate priority.
3. **Environment Parity:** Containers ensure that development, acceptance, and production execution environments are identical.

---

## Pipeline Stages Reference

<Sequence>
  <Step title="1. Commit Stage (Fast Feedback)" subtitle="Target: Under 5 Minutes">
    Triggered on every push to the `main` branch. Evaluates technical viability at the code level.
    - Compiles source code and checks syntax/linting rules.
    - Executes isolated, high-speed **Unit Tests** (mocking all external database dependencies).
    - **Outcome:** If successful, publishes unique Docker images tagged with the `GIT_SHA` to the private Artifact Registry.
  </Step>
  <Step title="2. Automated Acceptance Stage" subtitle="Target: Under 15 Minutes">
    Validates whether the release candidate delivers correct functional behavior.
    - Spins up a clean, transient environment using the identical Docker images generated in Step 1.
    - Automatically executes database migrations against a fresh test database instance.
    - Runs **End-to-End (E2E) Acceptance Tests** executing core CRUD operations (Create, Read, Update, Delete) through the API boundary.
    - **Outcome:** Certifies this specific image tag as a deployable production release candidate.
  </Step>
  <Step title="3. Production Deployment" subtitle="Continuous Deployment">
    Deploys the certified, immutable Docker artifacts directly to the production environment.
    - Executes zero-downtime rolling updates.
    - Runs production smoke tests to verify connectivity between Web, Logic, and Database layers.
  </Step>
</Sequence>

---

## Database Migration Strategy

In a Continuous Delivery model, database changes must never break co-existing application versions. To achieve zero-downtime deployments, all CRUD schema modifications strictly follow the **Expand and Contract** pattern:

| Phase | Database State | Application Logic State |
| :--- | :--- | :--- |
| **1. Expand** | Add new columns, tables, or constraints. Keep old structures intact. | Current production version runs smoothly, ignoring new additions. |
| **2. Deploy** | Database supports both states. | Deploy the new Backend version which reads/writes to the new schema structures. |
| **3. Contract** | Run a separate, post-deployment migration to safely deprecate and drop legacy columns/tables. | New application version is fully stabilized; old structures are cleanly removed. |

> ⚠️ **Critical Rule:** Never put breaking database schema changes and backend code updates into the same deployment unit. They must always be split into separate, backward-compatible steps.

---

## Local Development Loop

To maintain a fast local feedback loop before committing code to the repository, follow this workflow:

### Prerequisites
- Docker & Docker Compose
- A local task runner (e.g., `make` or `task`)

### 1. Spin up Dependencies
Bring up the database layer and run initial migrations locally:
```bash
docker compose up -d db
task db:migrate
