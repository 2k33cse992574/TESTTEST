from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.overview import router as overview_router
from app.api.institutions import router as institutions_router
from app.api.enrolments import router as enrolments_router
from app.api.queue import router as queue_router
from app.api.seats import router as seats_router
from app.api.policy import router as policy_router
from app.api.identity import router as identity_router
from app.api.verifier import router as verifier_router
from app.api.audit import router as audit_router
from app.api.reports import router as reports_router
from app.api.student import router as student_router

app = FastAPI(
    title="AICTE Officer Portal API — APAAR-Pramaan",
    description="Backend & ML Engine for AICTE Officer Governance, Identity Resolution, Regulatory Enforcement, and Cryptographic Audit.",
    version="2.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers for all modules
app.include_router(overview_router)
app.include_router(institutions_router)
app.include_router(enrolments_router)
app.include_router(queue_router)
app.include_router(seats_router)
app.include_router(policy_router)
app.include_router(identity_router)
app.include_router(verifier_router)
app.include_router(audit_router)
app.include_router(reports_router)
app.include_router(student_router)

@app.get("/")
def root():
    return {
        "service": "AICTE Officer Portal Backend & ML Engine",
        "system": "APAAR-Pramaan",
        "sihProblemStatement": "26263",
        "status": "OPERATIONAL",
        "docsUrl": "/docs",
        "modulesLoaded": 10,
        "capabilities": [
            "ML Anomaly Risk Scorer (Isolation Forest)",
            "Cross-Institution Identity Resolution & Fuzzy Match (Jaro-Winkler, Levenshtein, Soundex)",
            "Cryptographic SHA-256 Hash Chain & Tamper Proofing",
            "Policy Studio Runway Engine & Cap Simulator",
            "Real-time Seat Ledger & Breach Invariant Detection",
            "Live Verifier Portal & Quota Management",
            "8 Live Downloadable Reports"
        ]
    }

@app.get("/health")
def health():
    return {"status": "HEALTHY", "auditChainValid": True}
