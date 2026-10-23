# AICTE Officer Portal — APAAR-Pramaan
**Smart India Hackathon (SIH) Problem Statement 26263**

Dedicated, isolated production-grade implementation of the **AICTE Officer Portal** covering all 10 locked modules with a full **FastAPI Backend**, **Real Machine Learning Engine (Isolation Forest + Entity Resolution)**, and **Cryptographic SHA-256 Audit Hash Chain**.

---

## 📁 Workspace Architecture

```
d:\APAAR\aicte-portal\
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI core entrypoint, CORS, 10 routers
│   │   ├── models/                     # Strongly-typed Pydantic schemas
│   │   ├── db/state.py                 # In-memory reactive state manager
│   │   ├── ml/
│   │   │   ├── risk_scorer.py          # Isolation Forest unsupervised anomaly model
│   │   │   └── identity_resolver.py    # Jaro-Winkler, Levenshtein, Soundex matching
│   │   ├── audit/chain.py              # SHA-256 cryptographic linked block ledger
│   │   ├── engine/
│   │   │   └── policy_engine.py        # Runway stage state machine & backtesting
│   │   └── api/                        # 10 dedicated REST routers
│   ├── run.py                          # Startup script on port 8000
│   └── test_backend.py                 # Automated verification test
│
├── frontend/
│   ├── src/
│   │   ├── api/client.ts               # Fully typed backend API client
│   │   ├── pages/officer/              # 10 Officer Portal modules
│   │   ├── components/                 # Charts, Tables, Metric Cards, Modals
│   │   ├── context/AuthContext.tsx     # Officer session defaults
│   │   └── App.tsx                     # Dedicated router
│   ├── vite.config.ts                  # Vite + backend proxy (/api -> :8000)
│   └── package.json
│
├── start-backend.bat                   # 1-Click backend launcher
├── start-frontend.bat                  # 1-Click frontend launcher
└── start-all.bat                       # 1-Click full-stack launcher
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launcher (Windows)
Double-click `start-all.bat` inside `d:\APAAR\aicte-portal\` to start both the Backend (Port 8000) and Frontend (Port 5173).

### Option 2: Command Line
```powershell
# 1. Start Backend & ML Engine
cd d:\APAAR\aicte-portal\backend
.venv\Scripts\python.exe run.py

# 2. In a separate terminal, start Frontend
cd d:\APAAR\aicte-portal\frontend
npm run dev
```

- **Officer Portal Web UI**: [http://localhost:5173/officer](http://localhost:5173/officer)
- **FastAPI Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Verification & Feature Testing Guide

| Module | Route | What to Test |
|---|---|---|
| **1. Overview / Command Centre** | `/officer` | Inspect 4 live metric cards, National Enrolment trend, Trust distribution donut chart, Cases by Type bar chart, Single-Seat Lock invariant PASS indicator, critical cases, and live audit timeline. |
| **2. Institutions** | `/officer/institutions` | Click on any institution (e.g. *SIET Mumbai*). Open the **Regulatory Actions** tab in the drawer: enter rationale and test **Issue Show Cause Notice**, **Freeze Admissions** (marks status SUSPENDED), or **Order Re-audit**. Verification creates an immutable audit block. |
| **3. Central Enrolments** | `/officer/enrolments` | Filter by Hold state (`CONFLICT_HOLD`) or Trust tier (`L1`). Click any student to open the drawer: inspect explainable **ML Risk Assessment factors** (e.g. +45 pts for multi-claim). Use **Apply Conflict Hold** or test custom parameters in the **Simulate Risk** tool. Click **Export CSV** to download records. |
| **4. Integrity Queue** | `/officer/queue` | Priority-based case adjudication. Click any open case (e.g. `C-0042`), review explainable evidence pack, choose a decision (`Resolve — no issue`, `Uphold Breach & Sanction`), enter mandatory regulatory rationale, and click **Record Official Decision**. A confirmed cryptographic block is generated. |
| **5. Seat Ledger** | `/officer/seats` | National intake accounting. Inspect excess-admission breach alerts banner. Review pool status (REGULAR, TFW, NRI, FN, PMSSS) and per-institution over-intake tracking with visual progress bars. |
| **6. Policy Studio** | `/officer/policy` | Runway stage progression (`OBSERVE` → `WARN` → `SOFT` → `HARD`). Select any rule and test **Advance Stage** or **Revert Stage**. Click **Run Historical Back-test** to simulate 18.4K cohort impact. Move the **NRI / FN Cap Simulator** sliders to see real-time excess seat calculations. |
| **7. Identity Graph** | `/officer/identity` | Inspect candidates with duplicate names across institutions. Switch to the **Fuzzy Match Engine** tab: compare two names (`Kiran Reddy` vs `Kiran Redy`) to see live Jaro-Winkler, Levenshtein, and Soundex match metrics. Under **Merge Journal**, test the **Undo Consolidation** button. |
| **8. Verifier Portal** | `/officer/verifier` | Monitor third-party verifiers (TCS, Infosys, NAAC) and daily quota meters. Click the **Verification Simulator** tab: enter a student reference and consent token (e.g. `CNS-7821` for valid disclosure, or `CNS-7810` to test student revoked consent), execute query, and review selective disclosure and quota reduction. |
| **9. Audit Trail** | `/officer/audit` | Cryptographic SHA-256 hash-chain ledger. Click **Simulate Unauthorized Tamper**: watch the system immediately trigger a RED **HASH CHAIN INTEGRITY BREACH** alert at Block #1040 with "MISMATCH" hash. Click **Restore Genuine Chain** to restore validity. Test the **Historical Time Machine** to replay the ledger as of any past timestamp. |
| **10. Reports & Analytics** | `/officer/reports` | 4 analytics charts and 8 statutory downloadable reports. Click **Download** on any report (e.g. *National Enrolment Summary*, *Integrity Risk Report*, *Seat Ledger Audit Export*, or *Full Data Export JSON*) to trigger instant file download in the browser. |
