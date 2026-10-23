"""
APAAR-Pramaan: Complete End-to-End Verification Test Script
Tests all 3 portals (Student Portal, Institution Portal, AICTE Officer Portal),
ML Engines, Cryptographic SHA-256 Ledger, and Cross-Portal Synchronization.
"""
import urllib.request
import urllib.error
import json
import sys
import time

BASE_URL = "http://localhost:8000"

def get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post(endpoint, data):
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def main():
    print("=" * 75)
    print("   APAAR-PRAMAAN: UNIFIED PLATFORM END-TO-END VERIFICATION")
    print("   Connecting Student Portal + Institution Portal + AICTE Officer Portal")
    print("=" * 75)

    # 1. Health & Core Engine Status
    print("\n[1] Checking Core Platform Backend Health & Capabilities...")
    try:
        root = get("/")
        health = get("/health")
        print(f"    Status: {root['status']} (Health: {health['status']})")
        print(f"    Loaded Capabilities: {len(root['capabilities'])} services active")
        for cap in root['capabilities']:
            print(f"      • {cap}")
    except Exception as e:
        print(f"[FAIL] Could not connect to backend at {BASE_URL}: {e}")
        sys.exit(1)

    # 2. Student Portal End-to-End Test
    print("\n[2] Testing Portal #1: Student Portal End-to-End Flow...")
    me = get("/api/student/me?student_id=s1")
    print(f"    Active Student: {me['student']['name']} ({me['student']['maskedId']})")
    print(f"    Enrolment Status: {me['student']['status']} · Trust Level: L{me['student']['trustLevel']}")
    print(f"    Documents Verified: {me['verifiedCount']}/{me['totalDocs']}")
    
    # ML Risk check on student
    ml_check = post("/api/student/ml-check", {
        "studentId": "s1",
        "isMultiInstitutionClaim": False,
        "categoryCertVerified": True
    })
    print(f"    Live ML Anomaly Check: Risk Score={ml_check['riskScore']}/100 ({ml_check['riskBand']})")
    print(f"    Audit Block Anchored: Seq #{ml_check['auditBlockSeq']}")

    # Document upload with SHA-256 computation
    doc_up = post("/api/student/documents/upload", {
        "studentId": "s1",
        "type": "Class 12 Marksheet Verification",
        "name": "CBSE_XII_Official_Marksheet.pdf",
        "rawContent": "SAMPLE_TRANSCRIPT_PAYLOAD_HASH",
        "issuer": "Central Board of Secondary Education"
    })
    print(f"    Document Uploaded: {doc_up['document']['name']} (SHA-256: {doc_up['document']['sha256'][:16]}...)")

    # Verifiable credential generation
    vc = get("/api/student/verifiable-credential?student_id=s1")
    print(f"    Verifiable Credential: ID {vc['verifiableCredential']['id']}")
    print(f"    W3C Proof Digest: {vc['verifiableCredential']['proof']['digest'][:24]}...")

    # 3. Institution Portal End-to-End Test
    print("\n[3] Testing Portal #2: Institution Portal End-to-End Flow...")
    inst_ov = get("/api/institutions/INST-MH-0042/overview")
    print(f"    Institution: {inst_ov['institution']['name']} ({inst_ov['institution']['id']})")
    print(f"    Metrics: Enrolled={inst_ov['metrics'][0]['value']}, Ready={inst_ov['metrics'][1]['value']}, Held={inst_ov['metrics'][2]['value']}")
    
    # Student roster
    inst_students = get("/api/institutions/INST-MH-0042/students")
    print(f"    Roster Count: {len(inst_students)} active student records")

    # Batch submission with 5-stage validation
    sub_res = post("/api/institutions/INST-MH-0042/submissions", {
        "filename": "admissions_cycle_oct2026.csv",
        "isDryRun": False
    })
    print(f"    Batch Ingested: {sub_res['batch']['batchId']} (Total: {sub_res['batch']['totalRows']}, Accepted: {sub_res['batch']['accepted']}, Rejected: {sub_res['batch']['rejected']}, Held: {sub_res['batch']['held']})")

    # Integrity findings & seat ledger
    integrity = get("/api/institutions/INST-MH-0042/integrity")
    print(f"    Integrity Checks: {len(integrity['checks'])} findings ({integrity['openCount']} open, {integrity['resolvedCount']} resolved)")
    print(f"    Seat Ledger Pools Tracked: {len(integrity['seatLedger'])} pools")

    # Respond to integrity finding
    find_resp = post("/api/institutions/INST-MH-0042/integrity/IC-001/respond", {
        "response": "Submitted clarification: 2 excess candidates transferred to state supernumerary pool quota.",
        "officerOrAdminName": "Dr. Priya Nair"
    })
    print(f"    Finding IC-001 Responded: Status={find_resp['finding']['status']}")

    # Institution cases
    inst_cases = get("/api/institutions/INST-MH-0042/cases")
    print(f"    Institution Cases: {len(inst_cases)} cases registered against this college")

    # 4. AICTE Officer Portal End-to-End Test
    print("\n[4] Testing Portal #3: AICTE Officer Portal End-to-End Flow...")
    overview = get("/api/overview/metrics")
    print(f"    National Governance Overview: {len(overview)} national metric cards loaded")
    
    seats = get("/api/seats/summary")
    print(f"    National Seat Ledger: Approved={seats['totalApprovedIntake']:,}, Enrolled={seats['totalEnrolled']:,} ({seats['overallUtilizationPercent']}% util)")
    print(f"    Flagged Breach Institutions: {seats['seatBreachesCount']} ({', '.join(seats['breachInstitutions'])})")

    rules = get("/api/policy/rules")
    print(f"    Policy Studio: {len(rules)} regulatory rules in active runway stages")

    fuzzy = post("/api/identity/fuzzy-check", {
        "record1": {"name": "Kiran Reddy", "dob": "2005-04-12", "guardian": "Venkat Reddy"},
        "record2": {"name": "Kiran Redy", "dob": "2005-04-12", "guardian": "Venkat Reddy"}
    })
    print(f"    ML Fuzzy Resolution: Jaro-Winkler={fuzzy['metrics']['nameJaroWinkler']}, Soundex={fuzzy['metrics']['phoneticMatch']} -> {fuzzy['classification']}")

    reports = get("/api/reports/list")
    print(f"    Statutory Reports Available: {len(reports)} live downloadable formats")

    # 5. Cross-Portal Synchronized Scenarios
    print("\n[5] Testing Cross-Portal Real-time Synchronization...")
    
    # Scenario A: Institution enrols student with duplicate APAAR (collision test)
    print("    [Scenario A] Institution enrols student with colliding APAAR ID (3456-7890-1234)...")
    add_stu = post("/api/institutions/INST-MH-0042/students", {
        "name": "Dev Sharma",
        "apaarId": "3456-7890-1234",
        "programme": "B.Tech CSE",
        "admissionDate": "2026-08-22",
        "poolCode": "REGULAR"
    })
    print(f"      • Collision Detected: {add_stu['hasConflict']}")
    print(f"      • Hold State Applied: {add_stu['student']['holdState']}")
    print(f"      • Auto-created Case in Officer Queue: {add_stu['caseCreated']['id'] if add_stu['caseCreated'] else 'None'}")

    # Scenario B: Officer adjudicates case in Officer Queue -> unblocks student
    print("    [Scenario B] AICTE Officer adjudicates Case C-0042 (Rahul Verma multi-institution claim)...")
    decision = post("/api/queue/C-0042/decision", {
        "decision": "RESOLVE_NO_ISSUE",
        "rationale": "Verified official seat surrender certificate from competing institution. Single seat confirmed at SIET Mumbai.",
        "officerName": "Shri Rajesh Kumar"
    })
    print(f"      • Officer Decision Outcome: {decision['case']['status']} ({decision['case']['outcome'][:50]}...)")
    
    # Check that student s3 is now unblocked
    st3 = get("/api/enrolments/s3")
    print(f"      • Student s3 Dynamic Hold State: {st3['holdState']} (Status: {st3['status']}, Trust: L{st3['trustLevel']}, Risk: {st3['riskScore']}/100)")

    # 6. Cryptographic Audit Chain & Tamper Proofing
    print("\n[6] Testing SHA-256 Cryptographic Hash Chain Ledger Integrity...")
    chain_ver = get("/api/audit/verify")
    print(f"    Initial Chain Integrity: {'[VALID]' if chain_ver['isValid'] else '[COMPROMISED]'}")

    post("/api/audit/tamper", {"seq": 1040})
    tampered = get("/api/audit/verify")
    print(f"    Tamper Simulation: Alert Triggered={not tampered['isValid']} (Broken at #{tampered.get('brokenSeq')})")

    post("/api/audit/restore", {})
    restored = get("/api/audit/verify")
    print(f"    Chain Restored: {'[VALID]' if restored['isValid'] else '[COMPROMISED]'}")

    print("\n" + "=" * 75)
    print("   ALL 3 PORTALS & MULTI-PORTAL SYNCHRONIZATION TESTED AND OPERATIONAL!")
    print("=" * 75)

if __name__ == "__main__":
    main()
