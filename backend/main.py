from fastapi import FastAPI, HTTPException, UploadFile, File, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel, Field
from pathlib import Path
from datetime import datetime, timezone
import sqlite3, json, secrets, re, io, hashlib, hmac, base64, time
from openpyxl import load_workbook, Workbook

import os
BASE = Path(__file__).resolve().parent.parent
OFFICER_BASE_URL = os.environ.get("OFFICER_BASE_URL", "http://localhost:5174")
DB = BASE / "backend" / "bhoomidrishti_admin.db"
XLSX = BASE / "data" / "BhoomiDrishti_Dataset.xlsx"
AUTH_SECRET = os.environ.get("BHOOMIDRISHTI_AUTH_SECRET", "local-only-change-this-secret").encode()
DEV_AUTH = os.environ.get("BHOOMIDRISHTI_DEV_AUTH", "true").lower() == "true"
DEV_OTP = os.environ.get("BHOOMIDRISHTI_DEV_OTP", "842916")

app = FastAPI(title="BhoomiDrishti Admin API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

def now(): return datetime.now(timezone.utc).isoformat()

def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    con = db()
    con.executescript("""
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT UNIQUE NOT NULL, project_name TEXT NOT NULL,
      project_type TEXT NOT NULL, department TEXT NOT NULL,
      implementing_authority TEXT NOT NULL, state TEXT NOT NULL,
      district TEXT NOT NULL, mandal_taluk TEXT NOT NULL, village TEXT,
      description TEXT, start_date TEXT, planned_completion_date TEXT,
      budget_inr REAL DEFAULT 0, required_area_acres REAL DEFAULT 0,
      target_parcels INTEGER DEFAULT 0, priority TEXT DEFAULT 'Medium',
      acquisition_type TEXT DEFAULT 'Land Acquisition',
      compensation_rate_inr_per_acre REAL DEFAULT 0,
      compensation_rate_type TEXT DEFAULT 'Per Acre',
      boundary_geojson TEXT, mapped_area_acres REAL DEFAULT 0,
      status TEXT DEFAULT 'Draft', officer_id TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS project_parcels (
      id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL,
      parcel_id TEXT NOT NULL, match_method TEXT DEFAULT 'Registry Selection',
      matched_at TEXT NOT NULL, UNIQUE(project_id, parcel_id)
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL,
      action TEXT NOT NULL, project_id TEXT, details TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS land_parcel_cache (
      parcel_id TEXT PRIMARY KEY, project_id TEXT, survey_number TEXT,
      sub_division_number TEXT, village TEXT, mandal_taluk TEXT, district TEXT,
      land_area_acres REAL, land_type TEXT, ownership_type TEXT, owner_id TEXT,
      acquisition_status TEXT, possession_status TEXT, dispute_status TEXT,
      document_status TEXT, parcel_gis_id TEXT
    );
    CREATE TABLE IF NOT EXISTS family_cache (
      family_id TEXT PRIMARY KEY, project_id TEXT, parcel_id TEXT,
      family_name TEXT, family_size INTEGER, affected_area_acres REAL,
      compensation_eligible INTEGER, grievance_status TEXT, family_status TEXT
    );
    CREATE TABLE IF NOT EXISTS affected_users (
      user_id TEXT NOT NULL, project_id TEXT NOT NULL, parcel_id TEXT,
      name TEXT, mobile TEXT, land_area_acres REAL,
      current_stage TEXT DEFAULT 'Not Started', status TEXT DEFAULT 'Pending',
      account_status TEXT DEFAULT 'Not Created', invitation_status TEXT DEFAULT 'Not Sent',
      username TEXT, share_link TEXT, consent_status TEXT DEFAULT 'Pending', consent_at TEXT,
      document_status TEXT DEFAULT 'Not Submitted', documents_json TEXT DEFAULT '[]',
      verification_status TEXT DEFAULT 'Pending', final_outcome TEXT DEFAULT 'In Progress',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, project_id)
    );
    CREATE TABLE IF NOT EXISTS user_accounts (
      username TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT NOT NULL,
      parcel_id TEXT, case_id TEXT, name TEXT, mobile TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, project_id TEXT NOT NULL,
      username TEXT, share_token TEXT, share_link TEXT, channel TEXT DEFAULT 'SMS/WhatsApp', message TEXT, sent_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS excel_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, filename TEXT,
      rows_read INTEGER, rows_matched INTEGER, rows_skipped INTEGER, uploaded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL, project_name TEXT NOT NULL,
      risk_level TEXT NOT NULL, risk_score REAL DEFAULT 0,
      predicted_delay_days REAL DEFAULT 0,
      top_driver TEXT, recommended_action TEXT,
      district TEXT, state TEXT,
      status TEXT DEFAULT 'Unresolved',
      resolved_by TEXT, resolved_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS risk_assessments (
      project_id TEXT PRIMARY KEY, records_processed INTEGER DEFAULT 0,
      model_raw_delay_days REAL DEFAULT 0, predicted_delay_days REAL DEFAULT 0,
      risk_level TEXT DEFAULT 'UNKNOWN', risk_score REAL DEFAULT 0,
      risk_priority TEXT DEFAULT 'MONITOR', top_drivers_json TEXT DEFAULT '[]',
      recommended_action TEXT DEFAULT '', engineered_features_json TEXT DEFAULT '{}',
      users_json TEXT DEFAULT '[]', model_note TEXT DEFAULT '', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_users (
      username TEXT PRIMARY KEY, password_hash TEXT NOT NULL, role TEXT NOT NULL,
      full_name TEXT NOT NULL, mobile TEXT, active INTEGER DEFAULT 1, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS otp_challenges (
      challenge_id TEXT PRIMARY KEY, username TEXT NOT NULL, otp_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL, attempts INTEGER DEFAULT 0, used INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS binary_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, owner_id TEXT,
      filename TEXT NOT NULL, content_type TEXT NOT NULL, encrypted_blob BLOB NOT NULL,
      sha256 TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS officer_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, user_id TEXT NOT NULL,
      decision TEXT NOT NULL, notes TEXT DEFAULT '', decided_at TEXT NOT NULL
    );
    """)
    # Lightweight schema migration for databases created by an earlier build.
    for table, col, ddl in [
        ("affected_users","share_link","TEXT"),
        ("invitations","share_token","TEXT"),
        ("invitations","share_link","TEXT"),
        ("alerts","resolved_by","TEXT"),
        ("alerts","resolved_at","TEXT"),
        ("affected_users","consent_status","TEXT DEFAULT 'Pending'"),
        ("affected_users","consent_at","TEXT"),
        ("affected_users","document_status","TEXT DEFAULT 'Not Submitted'"),
        ("affected_users","documents_json","TEXT DEFAULT '[]'"),
        ("affected_users","verification_status","TEXT DEFAULT 'Pending'"),
        ("affected_users","final_outcome","TEXT DEFAULT 'In Progress'"),
    ]:
        cols={r[1] for r in con.execute(f"PRAGMA table_info({table})").fetchall()}
        if col not in cols: con.execute(f"ALTER TABLE {table} ADD COLUMN {col} {ddl}")
    con.commit(); con.close()

def _password_hash(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 240000)
    return base64.urlsafe_b64encode(salt + digest).decode()

def _password_matches(password: str, encoded: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(encoded.encode())
        return hmac.compare_digest(_password_hash(password, raw[:16]), encoded)
    except Exception:
        return False

def _signed_token(username: str, role: str) -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"sub": username, "role": role, "exp": int(time.time()) + 3600}, separators=(",", ":")).encode()).decode().rstrip("=")
    signature = hmac.new(AUTH_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{signature}"

def _current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Authentication required")
    try:
        payload, signature = authorization.split(" ", 1)[1].split(".", 1)
        if not hmac.compare_digest(signature, hmac.new(AUTH_SECRET, payload.encode(), hashlib.sha256).hexdigest()):
            raise ValueError
        data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        if int(data["exp"]) < int(time.time()): raise ValueError
        return data
    except Exception:
        raise HTTPException(401, "Invalid or expired session")

def _require_role(*roles: str):
    def dependency(user: dict = Depends(_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(403, "This action is not allowed for the current role")
        return user
    return dependency

def _encrypt_document(content: bytes) -> bytes:
    # Authenticated stream encryption for the local prototype; use managed KMS/object storage in production.
    nonce = secrets.token_bytes(16)
    encrypted = bytearray()
    for offset in range(0, len(content), 32):
        block = hashlib.sha256(AUTH_SECRET + nonce + (offset // 32).to_bytes(8, "big")).digest()
        encrypted.extend(value ^ block[index] for index, value in enumerate(content[offset:offset + 32]))
    tag = hmac.new(AUTH_SECRET, nonce + encrypted, hashlib.sha256).digest()
    return nonce + tag + bytes(encrypted)

def _decrypt_document(blob: bytes) -> bytes:
    nonce, tag, encrypted = blob[:16], blob[16:48], blob[48:]
    if not hmac.compare_digest(tag, hmac.new(AUTH_SECRET, nonce + encrypted, hashlib.sha256).digest()):
        raise HTTPException(500, "Document integrity check failed")
    content = bytearray()
    for offset in range(0, len(encrypted), 32):
        block = hashlib.sha256(AUTH_SECRET + nonce + (offset // 32).to_bytes(8, "big")).digest()
        content.extend(value ^ block[index] for index, value in enumerate(encrypted[offset:offset + 32]))
    return bytes(content)

def seed_reference():
    if not XLSX.exists(): return
    con=db()
    if con.execute("SELECT COUNT(*) c FROM projects").fetchone()["c"] == 0:
        wb0=load_workbook(XLSX,read_only=True,data_only=True)
        ws0=wb0["01_Project_Master"]; rows0=ws0.iter_rows(values_only=True); h0=[str(x or "") for x in next(rows0)]
        for row in rows0:
            r=dict(zip(h0,row))
            if not r.get("Project_ID"): continue
            t=str(r.get("Last_Updated") or now())
            con.execute("""INSERT OR IGNORE INTO projects
            (project_id,project_name,project_type,department,implementing_authority,state,district,mandal_taluk,
             start_date,planned_completion_date,budget_inr,required_area_acres,target_parcels,priority,
             status,officer_id,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",(
              r.get("Project_ID"),r.get("Project_Name") or "",r.get("Project_Type") or "Other",
              r.get("Department") or "Land Acquisition",r.get("Implementing_Authority") or "",
              r.get("State") or "",r.get("District") or "",r.get("Mandal_Taluk") or "",
              str(r.get("Start_Date") or ""),str(r.get("Planned_Completion_Date") or ""),
              float(r.get("Project_Budget_INR") or 0),float(r.get("Total_Project_Area_Acres") or 0),
              int(r.get("Total_Parcels") or 0),"High" if str(r.get("Current_Status"))=="Delayed" else "Medium",
              "Reference",r.get("Officer_ID"),str(r.get("Created_Date") or t),t))
        con.commit()
    if con.execute("SELECT COUNT(*) c FROM land_parcel_cache").fetchone()["c"] == 0:
        wb=load_workbook(XLSX,read_only=True,data_only=True)
        ws=wb["03_Land_Parcels"]; rows=ws.iter_rows(values_only=True); h=[str(x or "") for x in next(rows)]
        for row in rows:
            r=dict(zip(h,row))
            if not r.get("Parcel_ID"): continue
            con.execute("""INSERT OR IGNORE INTO land_parcel_cache VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",(
                r.get("Parcel_ID"),r.get("Project_ID"),r.get("Survey_Number"),r.get("Sub_Division_Number"),
                r.get("Village"),r.get("Mandal_Taluk"),r.get("District"),float(r.get("Land_Area_Acres") or 0),
                r.get("Land_Type"),r.get("Ownership_Type"),r.get("Owner_ID"),r.get("Acquisition_Status"),
                r.get("Possession_Status"),str(r.get("Dispute_Status")),r.get("Document_Status"),r.get("Parcel_GIS_ID")))
        ws=wb["04_Affected_Families"]; rows=ws.iter_rows(values_only=True); h=[str(x or "") for x in next(rows)]
        for row in rows:
            r=dict(zip(h,row))
            if not r.get("Family_ID"): continue
            con.execute("""INSERT OR IGNORE INTO family_cache VALUES (?,?,?,?,?,?,?,?,?)""",(
                r.get("Family_ID"),r.get("Project_ID"),r.get("Parcel_ID"),r.get("Family_Name"),
                int(r.get("Family_Size") or 0),float(r.get("Affected_Area_Acres") or 0),
                1 if r.get("Compensation_Eligible") else 0,r.get("Grievance_Status"),r.get("Family_Status")))
        con.commit()
    con.close()

init_db(); seed_reference()
_auth_con = db()
if not _auth_con.execute("SELECT 1 FROM auth_users WHERE username=?", ("admin@gov.in",)).fetchone():
    _auth_con.execute("INSERT INTO auth_users(username,password_hash,role,full_name,mobile,created_at) VALUES(?,?,?,?,?,?)", (
        "admin@gov.in", _password_hash("admin@123"), "Administrator",
        "Administrator", "+910000000000", now()))
    _auth_con.commit()
for _username, _password, _name, _mobile in [
    ("officer-102", "OfficerGov@2026", "Dr. Rajeshwar Sharma, IAS", "+910000000102"),
    ("officer-108", "OfficerGov@2026", "Shri A. K. Verma, IDAS", "+910000000108"),
]:
    if not _auth_con.execute("SELECT 1 FROM auth_users WHERE username=?", (_username,)).fetchone():
        _auth_con.execute("INSERT INTO auth_users(username,password_hash,role,full_name,mobile,created_at) VALUES(?,?,?,?,?,?)", (
            _username, _password_hash(_password), "Officer", _name, _mobile, now()))
        _auth_con.commit()
_auth_con.close()

class ProjectIn(BaseModel):
    project_name:str
    project_type:str
    department:str
    implementing_authority:str
    state:str
    district:str
    mandal_taluk:str
    village:str=""
    description:str=""
    start_date:str=""
    planned_completion_date:str=""
    budget_inr:float=0
    required_area_acres:float=Field(ge=0)
    target_parcels:int=Field(ge=0)
    priority:str="Medium"
    acquisition_type:str="Land Acquisition"
    compensation_rate_inr_per_acre:float=Field(ge=0)
    compensation_rate_type:str="Per Acre"
    boundary_geojson:dict|None=None
    mapped_area_acres:float=0

class BoundaryIn(BaseModel):
    boundary_geojson:dict
    mapped_area_acres:float=Field(default=0, ge=0)

class ParcelMatchIn(BaseModel):
    parcel_ids:list[str]

class LoginIn(BaseModel):
    username: str
    password: str

class OtpIn(BaseModel):
    challenge_id: str
    otp: str

class ApprovalIn(BaseModel):
    decision: str
    notes: str = ""

class AuditIn(BaseModel):
    actor: str
    action: str
    entity: str
    entity_id: str
    result: str
    details: str


@app.get("/api/health")
def health(): return {"ok":True}

@app.post("/api/auth/login")
def auth_login(payload: LoginIn):
    con = db(); user = con.execute("SELECT * FROM auth_users WHERE username=? AND active=1", (payload.username.strip().lower(),)).fetchone()
    if not user or not _password_matches(payload.password, user["password_hash"]):
        con.close(); raise HTTPException(401, "Official ID or password is incorrect")
    challenge_id = secrets.token_urlsafe(18)
    otp = DEV_OTP if DEV_AUTH else f"{secrets.randbelow(1000000):06d}"
    con.execute("INSERT INTO otp_challenges(challenge_id,username,otp_hash,expires_at,created_at) VALUES(?,?,?,?,?)", (
        challenge_id, user["username"], hashlib.sha256(otp.encode()).hexdigest(), int(time.time()) + 120, now()))
    con.execute("INSERT INTO audit_log(actor,action,details,created_at) VALUES(?,?,?,?)", (user["username"], "AUTH_LOGIN_OTP_REQUESTED", "Second factor requested", now()))
    con.commit(); con.close()
    response = {"challenge_id": challenge_id, "delivery": "development" if DEV_AUTH else "sms_whatsapp"}
    if DEV_AUTH: response["development_otp"] = otp
    return response

@app.post("/api/auth/verify-otp")
def auth_verify_otp(payload: OtpIn):
    con = db(); challenge = con.execute("SELECT * FROM otp_challenges WHERE challenge_id=?", (payload.challenge_id,)).fetchone()
    if not challenge or challenge["used"] or challenge["expires_at"] < int(time.time()) or challenge["attempts"] >= 5:
        con.close(); raise HTTPException(401, "The authentication code is invalid or expired")
    digest = hashlib.sha256(payload.otp.encode()).hexdigest()
    if not hmac.compare_digest(digest, challenge["otp_hash"]):
        con.execute("UPDATE otp_challenges SET attempts=attempts+1 WHERE challenge_id=?", (payload.challenge_id,)); con.commit(); con.close()
        raise HTTPException(401, "The authentication code is invalid or expired")
    user = con.execute("SELECT username,role,full_name FROM auth_users WHERE username=?", (challenge["username"],)).fetchone()
    con.execute("UPDATE otp_challenges SET used=1 WHERE challenge_id=?", (payload.challenge_id,))
    con.execute("INSERT INTO audit_log(actor,action,details,created_at) VALUES(?,?,?,?)", (challenge["username"], "AUTH_MFA_VERIFIED", "Authenticated session issued", now()))
    con.commit(); con.close()
    return {"access_token": _signed_token(user["username"], user["role"]), "token_type": "bearer", "user": dict(user)}

@app.post("/api/auth/logout")
def auth_logout(user: dict = Depends(_current_user)):
    con = db(); con.execute("INSERT INTO audit_log(actor,action,details,created_at) VALUES(?,?,?,?)", (user["sub"], "AUTH_LOGOUT", "Session ended", now())); con.commit(); con.close()
    return {"ok": True}

def project_row(row,con):
    d=dict(row)
    d["boundary_geojson"]=json.loads(d["boundary_geojson"]) if d["boundary_geojson"] else None
    d["matched_parcels"]=con.execute("SELECT COUNT(*) c FROM project_parcels WHERE project_id=?",(d["project_id"],)).fetchone()["c"]
    assessment=con.execute("SELECT risk_level,risk_score,predicted_delay_days,created_at FROM risk_assessments WHERE project_id=?",(d["project_id"],)).fetchone()
    d["risk_assessment"]=dict(assessment) if assessment else None
    return d

@app.get("/api/projects")
def projects():
    con=db(); rows=con.execute("SELECT * FROM projects ORDER BY updated_at DESC").fetchall()
    out=[project_row(r,con) for r in rows]; con.close(); return out

@app.post("/api/projects")
def create_project(p:ProjectIn, user: dict = Depends(_require_role("Administrator"))):
    con=db(); pid=f"BD-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"; t=now()
    con.execute("""INSERT INTO projects
    (project_id,project_name,project_type,department,implementing_authority,state,district,mandal_taluk,village,description,
     start_date,planned_completion_date,budget_inr,required_area_acres,target_parcels,priority,acquisition_type,
     compensation_rate_inr_per_acre,compensation_rate_type,boundary_geojson,mapped_area_acres,status,officer_id,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",(
      pid,p.project_name,p.project_type,p.department,p.implementing_authority,p.state,p.district,p.mandal_taluk,p.village,
      p.description,p.start_date,p.planned_completion_date,p.budget_inr,p.required_area_acres,p.target_parcels,p.priority,
      p.acquisition_type,p.compensation_rate_inr_per_acre,p.compensation_rate_type,
      json.dumps(p.boundary_geojson) if p.boundary_geojson else None,p.mapped_area_acres,"Draft",None,t,t))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("ADMIN001","PROJECT_CREATED",pid,"Project draft created",t))
    con.commit(); con.close(); return {"project_id":pid,"status":"Draft"}

@app.put("/api/projects/{pid}")
def update_project(pid:str,p:ProjectIn, user: dict = Depends(_require_role("Administrator"))):
    con=db(); r=con.execute("SELECT status FROM projects WHERE project_id=?",(pid,)).fetchone()
    if not r: con.close(); raise HTTPException(404,"Project not found")
    if r["status"]=="Published": con.close(); raise HTTPException(409,"Published projects are locked")
    t=now()
    con.execute("""UPDATE projects SET project_name=?,project_type=?,department=?,implementing_authority=?,state=?,district=?,
      mandal_taluk=?,village=?,description=?,start_date=?,planned_completion_date=?,budget_inr=?,required_area_acres=?,
      target_parcels=?,priority=?,acquisition_type=?,compensation_rate_inr_per_acre=?,compensation_rate_type=?,
      boundary_geojson=?,mapped_area_acres=?,officer_id=?,updated_at=? WHERE project_id=?""",(
      p.project_name,p.project_type,p.department,p.implementing_authority,p.state,p.district,p.mandal_taluk,p.village,p.description,
      p.start_date,p.planned_completion_date,p.budget_inr,p.required_area_acres,p.target_parcels,p.priority,p.acquisition_type,
      p.compensation_rate_inr_per_acre,p.compensation_rate_type,json.dumps(p.boundary_geojson) if p.boundary_geojson else None,
      p.mapped_area_acres,None,t,pid))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("ADMIN001","PROJECT_UPDATED",pid,"Project draft updated",t))
    con.commit(); con.close(); return {"ok":True}

@app.put("/api/projects/{pid}/boundary")
def update_boundary(pid:str,p:BoundaryIn, user: dict = Depends(_require_role("Administrator"))):
    con=db(); row=con.execute("SELECT status FROM projects WHERE project_id=?",(pid,)).fetchone()
    if not row: con.close(); raise HTTPException(404,"Project not found")
    if row["status"]=="Published": con.close(); raise HTTPException(409,"Published projects are locked")
    t=now()
    con.execute("UPDATE projects SET boundary_geojson=?,mapped_area_acres=?,updated_at=? WHERE project_id=?",(json.dumps(p.boundary_geojson),p.mapped_area_acres,t,pid))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",("ADMIN001","PROJECT_LOCATION_UPDATED",pid,"GIS boundary updated",t))
    con.commit(); con.close(); return {"ok":True,"mapped_area_acres":p.mapped_area_acres}

@app.get("/api/projects/{pid}")
def get_project(pid:str):
    con=db(); r=con.execute("SELECT * FROM projects WHERE project_id=?",(pid,)).fetchone()
    if not r: con.close(); raise HTTPException(404,"Project not found")
    d=dict(r); d["boundary_geojson"]=json.loads(d["boundary_geojson"]) if d["boundary_geojson"] else None
    d["parcels"]=[dict(x) for x in con.execute("""SELECT lp.*,fc.Family_Name,fc.Family_Size,fc.Affected_Area_Acres,fc.Compensation_Eligible
       FROM project_parcels pp JOIN land_parcel_cache lp ON lp.parcel_id=pp.parcel_id
       LEFT JOIN family_cache fc ON fc.parcel_id=lp.parcel_id WHERE pp.project_id=?""",(pid,)).fetchall()]
    d["matched_parcels"]=len(d["parcels"]); con.close(); return d

@app.get("/api/registry/parcels")
def registry(q:str|None=None,district:str|None=None,village:str|None=None):
    con=db(); sql="""SELECT lp.*,fc.Family_Name,fc.Family_Size,fc.Affected_Area_Acres,fc.Compensation_Eligible,fc.Grievance_Status
       FROM land_parcel_cache lp LEFT JOIN family_cache fc ON fc.parcel_id=lp.parcel_id WHERE 1=1"""; args=[]
    if q: sql+=" AND (lp.parcel_id LIKE ? OR lp.survey_number LIKE ? OR fc.family_name LIKE ?)"; args += [f"%{q}%"]*3
    if district: sql+=" AND lp.district=?"; args.append(district)
    if village: sql+=" AND lp.village=?"; args.append(village)
    rows=con.execute(sql+" ORDER BY lp.parcel_id LIMIT 200",args).fetchall(); out=[dict(r) for r in rows]; con.close(); return out

@app.post("/api/projects/{pid}/parcels")
def match_parcels(pid:str,p:ParcelMatchIn, user: dict = Depends(_require_role("Administrator"))):
    con=db()
    if not con.execute("SELECT 1 FROM projects WHERE project_id=?",(pid,)).fetchone():
        con.close(); raise HTTPException(404,"Project not found")
    valid=[]
    if p.parcel_ids:
        qs=",".join("?"*len(p.parcel_ids))
        valid=[r["parcel_id"] for r in con.execute(f"SELECT parcel_id FROM land_parcel_cache WHERE parcel_id IN ({qs})",p.parcel_ids)]
    t=now()
    for x in valid: con.execute("INSERT OR IGNORE INTO project_parcels(project_id,parcel_id,matched_at) VALUES(?,?,?)",(pid,x,t))
    con.execute("UPDATE projects SET updated_at=? WHERE project_id=?",(t,pid))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("ADMIN001","PARCELS_MATCHED",pid,f"{len(valid)} registry parcels linked",t))
    con.commit(); con.close(); return {"ok":True,"matched":len(valid)}

@app.get("/api/projects/{pid}/validation")
def validation(pid:str):
    con=db(); p=con.execute("SELECT * FROM projects WHERE project_id=?",(pid,)).fetchone()
    if not p: con.close(); raise HTTPException(404,"Project not found")
    matched=con.execute("SELECT COUNT(*) c FROM project_parcels WHERE project_id=?",(pid,)).fetchone()["c"]
    # Drafts may be incomplete, but publication is allowed only when the
    # official project record is complete and linked to at least one parcel.
    issues=[]; warnings=[]
    required_text={
        "project_name":"Project name is required.",
        "project_type":"Project type is required.",
        "department":"Department is required.",
        "implementing_authority":"Implementing authority is required.",
        "state":"State is required.",
        "district":"District is required.",
        "mandal_taluk":"Mandal/Taluk is required.",
        "village":"Village is required.",
        "start_date":"Start date is required.",
        "planned_completion_date":"Planned completion date is required.",
    }
    for field,msg in required_text.items():
        if not str(p[field] or '').strip(): issues.append(msg)
    if p["budget_inr"]<=0: issues.append("Project budget must be greater than zero.")
    if p["required_area_acres"]<=0: issues.append("Required acquisition area must be greater than zero.")
    if p["target_parcels"]<=0: issues.append("Target parcel count must be greater than zero.")
    if p["compensation_rate_inr_per_acre"]<=0: issues.append("Compensation rate must be greater than zero.")
    if not p["boundary_geojson"]: issues.append("Acquisition boundary must be mapped.")
    if p["boundary_geojson"] and p["mapped_area_acres"]<=0: issues.append("Mapped area could not be calculated.")
    if matched==0: issues.append("At least one registry parcel must be linked before publishing.")
    if p["required_area_acres"] and p["mapped_area_acres"]:
        if p["mapped_area_acres"]>p["required_area_acres"]*1.05:
            warnings.append("Mapped area is more than 5% above the required acquisition area.")
        if p["mapped_area_acres"]<p["required_area_acres"]*0.95:
            warnings.append("Mapped area is more than 5% below the required acquisition area.")
    con.close(); return {"passed":not issues,"issues":issues,"warnings":warnings,"matched_parcels":matched}

@app.post("/api/projects/{pid}/publish")
def publish(pid:str, user: dict = Depends(_require_role("Administrator"))):
    con=db(); r=con.execute("SELECT * FROM projects WHERE project_id=?",(pid,)).fetchone()
    if not r: con.close(); raise HTTPException(404,"Project not found")
    # One implicit Officer workspace. Validation is advisory; Admin may publish
    # with non-critical incomplete/correctable details.
    if not str(r["project_name"] or "").strip():
        con.close(); raise HTTPException(409,"Project name is required before publishing.")
    t=now(); con.execute("UPDATE projects SET status='Published',officer_id=NULL,updated_at=? WHERE project_id=?",(t,pid))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("ADMIN001","PROJECT_PUBLISHED",pid,"Project assigned to the single Officer workspace and published",t))
    con.commit(); con.close(); return {"ok":True,"status":"Published","workspace":"Officer"}

@app.get("/api/projects/{pid}/audit")
def audit(pid:str):
    con=db(); rows=con.execute("SELECT * FROM audit_log WHERE project_id=? ORDER BY id DESC",(pid,)).fetchall()
    out=[dict(r) for r in rows]; con.close(); return out

@app.post("/api/audit")
def create_audit(a: AuditIn):
    con=db()
    project_id = a.entity_id if a.entity == "PROJECT" else None
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                (a.actor, a.action, project_id, a.details, now()))
    con.commit(); con.close(); return {"ok":True}

@app.get("/api/audit")
def list_audit(project_id: str | None = None):
    con=db()
    if project_id:
        rows = con.execute("SELECT * FROM audit_log WHERE project_id=? ORDER BY id DESC LIMIT 200", (project_id,)).fetchall()
    else:
        rows = con.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 200").fetchall()
    out=[dict(r) for r in rows]; con.close(); return out

class RiskAssessmentIn(BaseModel):
    records_processed: int = Field(default=0, ge=0)
    model_raw_delay_days: float = 0
    predicted_delay_days: float = 0
    risk_level: str = "UNKNOWN"
    risk_score: float = 0
    risk_priority: str = "MONITOR"
    top_drivers: list = []
    recommended_action: str = ""
    engineered_features: dict = {}
    users: list = []
    note: str = ""

@app.get("/api/projects/{pid}/risk-assessment")
def get_risk_assessment(pid: str, user: dict = Depends(_require_role("Administrator", "Officer"))):
    con=db(); row=con.execute("SELECT * FROM risk_assessments WHERE project_id=?",(pid,)).fetchone()
    if not row: con.close(); raise HTTPException(404,"Risk assessment not found")
    d=dict(row)
    for key in ("top_drivers_json", "engineered_features_json", "users_json"):
        d[key.removesuffix("_json")]=json.loads(d.pop(key) or ("[]" if key != "engineered_features_json" else "{}"))
    con.close(); return d

@app.put("/api/projects/{pid}/risk-assessment")
def save_risk_assessment(pid: str, assessment: RiskAssessmentIn, user: dict = Depends(_require_role("Administrator", "Officer"))):
    con=db()
    if not con.execute("SELECT 1 FROM projects WHERE project_id=?",(pid,)).fetchone():
        con.close(); raise HTTPException(404,"Project not found")
    t=now()
    con.execute("""INSERT INTO risk_assessments(project_id,records_processed,model_raw_delay_days,predicted_delay_days,
      risk_level,risk_score,risk_priority,top_drivers_json,recommended_action,engineered_features_json,users_json,model_note,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET records_processed=excluded.records_processed,
      model_raw_delay_days=excluded.model_raw_delay_days,predicted_delay_days=excluded.predicted_delay_days,
      risk_level=excluded.risk_level,risk_score=excluded.risk_score,risk_priority=excluded.risk_priority,
      top_drivers_json=excluded.top_drivers_json,recommended_action=excluded.recommended_action,
      engineered_features_json=excluded.engineered_features_json,users_json=excluded.users_json,model_note=excluded.model_note,created_at=excluded.created_at""",
      (pid,assessment.records_processed,assessment.model_raw_delay_days,assessment.predicted_delay_days,assessment.risk_level,
       assessment.risk_score,assessment.risk_priority,json.dumps(assessment.top_drivers),assessment.recommended_action,
       json.dumps(assessment.engineered_features),json.dumps(assessment.users),assessment.note,t))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("ML_ENGINE","RISK_ASSESSMENT_SAVED",pid,f"{assessment.risk_level} risk assessment saved from {assessment.records_processed} records",t))
    con.commit(); con.close(); return {"ok":True,"project_id":pid,"risk_level":assessment.risk_level,"created_at":t}

# ============================================================
# OFFICER MODULE
#
# Bridges the Admin-published project, the current Excel of
# operational status, and (in a later phase) the User/Landowner
# portal. This deliberately reuses the same database, project_id,
# parcel_id and family_id space that Admin already created rather
# than standing up a disconnected third application.
#
# Scope: published project dashboard, project-specific current Excel upload,
# trained ML risk analysis, affected-user onboarding and personalized share links.
# The Admin and Officer experiences reuse this same database/project_id space.
# ============================================================


def _project_user_stats(pid,con):
    users=con.execute("SELECT * FROM affected_users WHERE project_id=?",(pid,)).fetchall()
    return {
        "total_users":len(users),
        "accounts_created":sum(1 for u in users if u["account_status"]=="Created"),
        "accounts_pending":sum(1 for u in users if u["account_status"]!="Created"),
        "invitations_sent":sum(1 for u in users if u["invitation_status"]=="Sent"),
        "invitations_pending":sum(1 for u in users if u["invitation_status"]!="Sent"),
        "completed_actions":sum(1 for u in users if u["status"]=="Completed"),
        "pending_actions":sum(1 for u in users if u["status"]!="Completed"),
    }

@app.get("/api/officer/dashboard")
def officer_dashboard(user: dict = Depends(_require_role("Administrator", "Officer"))):
    con=db()
    rows=con.execute("SELECT * FROM projects WHERE status='Published' ORDER BY updated_at DESC",
                      )
    out=[]
    for r in rows:
        d=project_row(r,con); d["user_stats"]=_project_user_stats(d["project_id"],con)
        last=con.execute("SELECT MAX(uploaded_at) t FROM excel_uploads WHERE project_id=?",(d["project_id"],)).fetchone()["t"]
        d["last_excel_upload"]=last
        out.append(d)
    con.close(); return out

@app.get("/api/officer/projects/{pid}")
def officer_project(pid:str, user: dict = Depends(_require_role("Administrator", "Officer"))):
    con=db(); r=con.execute("SELECT * FROM projects WHERE project_id=?",(pid,)).fetchone()
    if not r: con.close(); raise HTTPException(404,"Project not found")
    if r["status"]!="Published":
        con.close(); raise HTTPException(403,"Project is not assigned to this officer")
    d=dict(r); d["boundary_geojson"]=json.loads(d["boundary_geojson"]) if d["boundary_geojson"] else None
    d["parcels"]=[dict(x) for x in con.execute("""SELECT lp.*,fc.Family_Name,fc.Family_Size,fc.Affected_Area_Acres,fc.Compensation_Eligible
       FROM project_parcels pp JOIN land_parcel_cache lp ON lp.parcel_id=pp.parcel_id
       LEFT JOIN family_cache fc ON fc.parcel_id=lp.parcel_id WHERE pp.project_id=?""",(pid,)).fetchall()]
    d["matched_parcels"]=len(d["parcels"])
    d["user_stats"]=_project_user_stats(pid,con)
    d["users"]=[dict(x) for x in con.execute("SELECT * FROM affected_users WHERE project_id=? ORDER BY name",(pid,)).fetchall()]
    con.close(); return d

# --- Current Excel upload -----------------------------------------------

_HEADER_ALIASES={
    "parcel_id":{"parcel_id","parcelid","land_parcel_id","parcel","parcel_no","parcel_number"},
    "family_id":{"family_id","user_id","familyid","case_id"},
    "name":{"family_name","name","owner_name","user_name","landowner_name"},
    "mobile":{"mobile","mobile_number","phone","contact","contact_number","registered_mobile"},
    "area":{"affected_area_acres","area","land_area_acres","area_acres"},
    "stage":{"current_stage","stage","process_stage"},
    "status":{"status","current_status"},
}
def _norm(h): return re.sub(r"[^a-z0-9]+","_",str(h or "").strip().lower()).strip("_")
def _canon_row(headers,row):
    raw=dict(zip(headers,row)); out={}
    for canon,aliases in _HEADER_ALIASES.items():
        for h,v in raw.items():
            if h in aliases and v not in (None,""):
                out[canon]=v; break
    return out

@app.get("/api/officer/projects/{pid}/sample-excel")
def officer_sample_excel(pid:str, user: dict = Depends(_require_role("Administrator", "Officer"))):
    """Generates a ready-to-upload 'current Excel' for this project, built from
    the same parcel/family registry Admin already matched to the project.
    Mobile numbers are synthesized (marked SIMULATED) since the supplied
    historical dataset does not include contact numbers. A real deployment
    would source current operational data, including contact details, from
    the authoritative land-record system rather than this template."""
    con=db()
    if not con.execute("SELECT 1 FROM projects WHERE project_id=?",(pid,)).fetchone():
        con.close(); raise HTTPException(404,"Project not found")
    rows=con.execute("""SELECT lp.parcel_id,lp.land_area_acres,fc.family_id,fc.family_name
        FROM project_parcels pp JOIN land_parcel_cache lp ON lp.parcel_id=pp.parcel_id
        LEFT JOIN family_cache fc ON fc.parcel_id=lp.parcel_id WHERE pp.project_id=?""",(pid,)).fetchall()
    con.close()
    wb=Workbook(); ws=wb.active; ws.title="Current_Status"
    ws.append(["Parcel_ID","Family_ID","Family_Name","Mobile_Number","Affected_Area_Acres","Current_Stage","Status"])
    for i,r in enumerate(rows):
        digest=int(hashlib.sha256(str(r['parcel_id']).encode()).hexdigest(), 16)
        mobile=f"9{700000000+(digest % 99999999):08d}"  # SIMULATED demo contact number (deterministic per parcel)
        ws.append([r["parcel_id"],r["family_id"],r["family_name"],mobile,r["land_area_acres"],"Document Submission","Pending"])
    buf=io.BytesIO(); wb.save(buf); buf.seek(0)
    return StreamingResponse(buf,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition":f'attachment; filename="{pid}_current_status_SAMPLE.xlsx"'})

@app.post("/api/officer/projects/{pid}/excel")
async def officer_upload_excel(pid:str,file:UploadFile=File(...), user: dict = Depends(_require_role("Officer", "Administrator"))):
    con=db(); proj=con.execute("SELECT * FROM projects WHERE project_id=?",(pid,)).fetchone()
    if not proj: con.close(); raise HTTPException(404,"Project not found")
    if proj["status"]!="Published":
        con.close(); raise HTTPException(403,"Project is not assigned to this officer")
    if not file.filename.lower().endswith((".xlsx",".xlsm")):
        con.close(); raise HTTPException(400,"Only .xlsx/.xlsm files are accepted")
    content=await file.read()
    try:
        wb=load_workbook(io.BytesIO(content),data_only=True)
    except Exception:
        con.close(); raise HTTPException(400,"Could not read the uploaded file. Please upload a valid Excel workbook.")
    ws=None
    for s in wb.sheetnames:
        if "current" in s.lower(): ws=wb[s]; break
    if ws is None: ws=wb.worksheets[0]
    rows_iter=ws.iter_rows(values_only=True)
    try: headers=[_norm(h) for h in next(rows_iter)]
    except StopIteration:
        con.close(); raise HTTPException(400,"The uploaded sheet is empty")
    valid_parcels={r["parcel_id"] for r in con.execute("SELECT parcel_id FROM project_parcels WHERE project_id=?",(pid,))}
    read=matched=skipped=0; t=now()
    for row in rows_iter:
        if row is None or all(v in (None,"") for v in row): continue
        read+=1
        r=_canon_row(headers,row)
        parcel_id=r.get("parcel_id")
        if not parcel_id or parcel_id not in valid_parcels: skipped+=1; continue
        fam=con.execute("SELECT * FROM family_cache WHERE parcel_id=?",(parcel_id,)).fetchone()
        user_id=r.get("family_id") or (fam["family_id"] if fam else None) or f"{pid}-PARCEL-{parcel_id}"
        name=r.get("name") or (fam["family_name"] if fam else "Unregistered owner")
        area=r.get("area") or (fam["affected_area_acres"] if fam else None)
        existing=con.execute("SELECT account_status,invitation_status,username,share_link FROM affected_users WHERE user_id=? AND project_id=?",
                              (user_id,pid)).fetchone()
        con.execute("""INSERT INTO affected_users(user_id,project_id,parcel_id,name,mobile,land_area_acres,current_stage,status,
            account_status,invitation_status,username,share_link,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(user_id,project_id) DO UPDATE SET parcel_id=excluded.parcel_id,name=excluded.name,
            mobile=excluded.mobile,land_area_acres=excluded.land_area_acres,current_stage=excluded.current_stage,
            status=excluded.status,updated_at=excluded.updated_at""",(
            user_id,pid,parcel_id,name,r.get("mobile"),area,r.get("stage") or "Not Started",r.get("status") or "Pending",
            existing["account_status"] if existing else "Not Created",
            existing["invitation_status"] if existing else "Not Sent",
            existing["username"] if existing else None, existing["share_link"] if existing else None, t,t))
        matched+=1
    con.execute("INSERT INTO excel_uploads(project_id,filename,rows_read,rows_matched,rows_skipped,uploaded_at) VALUES(?,?,?,?,?,?)",
                (pid,file.filename,read,matched,skipped,t))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("OFFICER","CURRENT_EXCEL_UPLOADED",pid,
                 f"{file.filename}: {read} rows read, {matched} matched to project parcels, {skipped} skipped",t))
    con.commit(); con.close()
    return {"ok":True,"rows_read":read,"rows_matched":matched,"rows_skipped":skipped}

@app.get("/api/officer/projects/{pid}/users")
def officer_users(pid:str, user: dict = Depends(_require_role("Officer", "Administrator"))):
    con=db(); rows=con.execute("SELECT * FROM affected_users WHERE project_id=? ORDER BY name",(pid,)).fetchall()
    out=[dict(r) for r in rows]; con.close(); return out

def _username_for(name,con):
    parts=re.sub(r"[^a-zA-Z\s]","",name or "").lower().split()
    base=".".join(parts[:2]) if len(parts)>=2 else (parts[0] if parts else "user")
    base=base or "user"
    candidate=base; n=1
    while con.execute("SELECT 1 FROM user_accounts WHERE username=?",(candidate,)).fetchone():
        n+=1; candidate=f"{base}{n}"
    return candidate

@app.post("/api/officer/projects/{pid}/accounts")
def officer_create_accounts(pid:str, user: dict = Depends(_require_role("Officer", "Administrator"))):
    con=db()
    if not con.execute("SELECT 1 FROM projects WHERE project_id=? AND status='Published'",(pid,)).fetchone():
        con.close(); raise HTTPException(404,"Project not found or not assigned to this officer")
    pending=con.execute("SELECT * FROM affected_users WHERE project_id=? AND account_status!='Created'",(pid,)).fetchall()
    created=[]; skipped_no_mobile=[]
    t=now()
    for u in pending:
        if not u["mobile"]:
            skipped_no_mobile.append(u["user_id"]); continue
        uname=_username_for(u["name"],con)
        con.execute("""INSERT INTO user_accounts(username,user_id,project_id,parcel_id,case_id,name,mobile,created_at)
            VALUES(?,?,?,?,?,?,?,?)""",(uname,u["user_id"],pid,u["parcel_id"],u["user_id"],u["name"],u["mobile"],t))
        con.execute("UPDATE affected_users SET account_status='Created',username=?,updated_at=? WHERE user_id=? AND project_id=?",
                    (uname,t,u["user_id"],pid))
        created.append(uname)
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("OFFICER","ACCOUNTS_CREATED",pid,
                 f"{len(created)} accounts created; {len(skipped_no_mobile)} skipped (missing registered mobile)",t))
    con.commit(); con.close()
    return {"ok":True,"created":created,"skipped_missing_mobile":skipped_no_mobile}

@app.post("/api/officer/projects/{pid}/invitations")
def officer_send_invitations(pid:str, user: dict = Depends(_require_role("Officer", "Administrator"))):
    con=db()
    proj=con.execute("SELECT project_name FROM projects WHERE project_id=? AND status='Published'",(pid,)).fetchone()
    if not proj: con.close(); raise HTTPException(404,"Project not found or not assigned to this officer")
    ready=con.execute("""SELECT * FROM affected_users WHERE project_id=? AND account_status='Created'
        AND invitation_status!='Sent'""",(pid,)).fetchall()
    t=now(); sent=[]
    for u in ready:
        token=secrets.token_urlsafe(18)
        share_link=f"{OFFICER_BASE_URL}/landowner/invite/{token}"
        message=(f"Dear {u['name']},\n\nYour land parcel {u['parcel_id']} has been included in the land acquisition "
                 f"process for {proj['project_name']}. Please use your personalized secure link to review the project, "
                 f"confirm consent and complete the required document-verification steps.\n\n"
                 f"Username: {u['username']}\nPortal: {share_link}\n"
                 f"Your registered mobile number will be used for OTP verification in the user portal.\n"
                 f"Please do not share your OTP or password.")
        con.execute("INSERT INTO invitations(user_id,project_id,username,share_token,share_link,channel,message,sent_at) VALUES(?,?,?,?,?,?,?,?)",
                    (u["user_id"],pid,u["username"],token,share_link,"SMS/WhatsApp (simulated)",message,t))
        con.execute("UPDATE affected_users SET invitation_status='Sent',share_link=?,updated_at=? WHERE user_id=? AND project_id=?",
                    (share_link,t,u["user_id"],pid))
        sent.append(u["username"])
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("OFFICER","INVITATIONS_SENT",pid,f"{len(sent)} invitations dispatched (simulated)",t))
    con.commit(); con.close()
    return {"ok":True,"sent":sent}

@app.get("/api/landowner/invite/{token}")
def landowner_invite(token:str):
    con=db(); r=con.execute("""SELECT i.*,u.name,u.mobile,u.parcel_id,u.current_stage,u.status,p.project_name,p.project_type,p.district,p.village,p.compensation_rate_inr_per_acre
      FROM invitations i JOIN affected_users u ON u.user_id=i.user_id AND u.project_id=i.project_id
      JOIN projects p ON p.project_id=i.project_id WHERE i.share_token=? ORDER BY i.id DESC LIMIT 1""",(token,)).fetchone()
    if not r: con.close(); raise HTTPException(404,"Share link is invalid or expired")
    d=dict(r)
    d["documents"] = json.loads(d.pop("documents_json") or "[]")
    con.close(); return d

def _invite_user(token, con):
    return con.execute("""SELECT i.user_id,i.project_id,u.*,p.project_name,p.project_type,p.state,p.district,
        p.mandal_taluk,p.village,p.required_area_acres,p.compensation_rate_inr_per_acre,p.compensation_rate_type,
        p.budget_inr FROM invitations i JOIN affected_users u ON u.user_id=i.user_id AND u.project_id=i.project_id
        JOIN projects p ON p.project_id=i.project_id WHERE i.share_token=? ORDER BY i.id DESC LIMIT 1""", (token,)).fetchone()

class ConsentIn(BaseModel):
    decision: str

@app.post("/api/landowner/invite/{token}/consent")
def landowner_consent(token: str, payload: ConsentIn):
    decision = payload.decision if payload.decision in ("Accepted", "Correction Required") else "Pending"
    if decision == "Pending": raise HTTPException(400, "Choose a valid consent decision")
    con=db(); row=_invite_user(token, con)
    if not row: con.close(); raise HTTPException(404, "Share link is invalid or expired")
    t=now(); status="Consent Given" if decision == "Accepted" else "Correction Required"
    con.execute("UPDATE affected_users SET consent_status=?,consent_at=?,status=?,current_stage=?,updated_at=? WHERE user_id=? AND project_id=?",
                (decision,t,status,"Document Submission" if decision == "Accepted" else "Correction Required",t,row["user_id"],row["project_id"]))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                (row["user_id"],"LANDOWNER_CONSENT_UPDATED",row["project_id"],f"Consent decision: {decision}",t))
    con.commit(); con.close(); return {"ok":True,"consent_status":decision,"current_stage": "Document Submission" if decision == "Accepted" else "Correction Required"}

class DocumentSubmissionIn(BaseModel):
    documents: list[str]

@app.post("/api/landowner/invite/{token}/documents")
def landowner_documents(token: str, payload: DocumentSubmissionIn):
    docs=[str(item).strip() for item in payload.documents if str(item).strip()]
    if not docs: raise HTTPException(400, "Add at least one document")
    con=db(); row=_invite_user(token, con)
    if not row: con.close(); raise HTTPException(404, "Share link is invalid or expired")
    t=now()
    con.execute("UPDATE affected_users SET document_status='Submitted',documents_json=?,verification_status='Under Review',current_stage='Verification',status='Documents Submitted',updated_at=? WHERE user_id=? AND project_id=?",
                (json.dumps(docs),t,row["user_id"],row["project_id"]))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                (row["user_id"],"LANDOWNER_DOCUMENTS_SUBMITTED",row["project_id"],f"{len(docs)} document(s) submitted for verification",t))
    con.commit(); con.close(); return {"ok":True,"document_status":"Submitted","verification_status":"Under Review","documents":docs}

@app.post("/api/landowner/invite/{token}/submit")
def landowner_submit(token: str):
    con=db(); row=_invite_user(token, con)
    if not row: con.close(); raise HTTPException(404, "Share link is invalid or expired")
    if row["consent_status"] != "Accepted" or row["document_status"] != "Submitted":
        con.close(); raise HTTPException(409, "Consent and documents are required before submitting")
    t=now(); con.execute("UPDATE affected_users SET current_stage='Officer Verification',status='Submitted for Verification',updated_at=? WHERE user_id=? AND project_id=?",
                         (t,row["user_id"],row["project_id"]))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                (row["user_id"],"LANDOWNER_SUBMISSION_COMPLETED",row["project_id"],"Landowner submission sent for officer verification",t))
    con.commit(); con.close(); return {"ok":True,"status":"Submitted for Verification","current_stage":"Officer Verification"}

@app.post("/api/landowner/invite/{token}/documents/upload")
async def landowner_upload_document(token: str, file: UploadFile = File(...)):
    row_con = db(); row = _invite_user(token, row_con)
    if not row: row_con.close(); raise HTTPException(404, "Share link is invalid or expired")
    content = await file.read()
    if not content or len(content) > 15 * 1024 * 1024:
        row_con.close(); raise HTTPException(413, "Document must be smaller than 15 MB")
    allowed = {"application/pdf", "image/jpeg", "image/png"}
    if file.content_type not in allowed:
        row_con.close(); raise HTTPException(400, "Only PDF, JPG, and PNG documents are accepted")
    encrypted = _encrypt_document(content); digest = hashlib.sha256(content).hexdigest(); t = now()
    cur = row_con.execute("INSERT INTO binary_documents(project_id,owner_id,filename,content_type,encrypted_blob,sha256,created_at) VALUES(?,?,?,?,?,?,?)", (
        row["project_id"], row["user_id"], file.filename or "document", file.content_type, encrypted, digest, t))
    row_con.execute("UPDATE affected_users SET document_status='Submitted',verification_status='Under Review',current_stage='Verification',status='Documents Submitted',updated_at=? WHERE user_id=? AND project_id=?", (t, row["user_id"], row["project_id"]))
    row_con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)", (row["user_id"], "BINARY_DOCUMENT_UPLOADED", row["project_id"], f"Encrypted document stored: {file.filename}", t))
    row_con.commit(); row_con.close()
    return {"ok": True, "document_id": cur.lastrowid, "filename": file.filename, "sha256": digest, "verification_status": "Under Review"}

@app.get("/api/documents/{document_id}")
def download_document(document_id: int, user: dict = Depends(_current_user)):
    con = db(); row = con.execute("SELECT * FROM binary_documents WHERE id=?", (document_id,)).fetchone()
    if not row: con.close(); raise HTTPException(404, "Document not found")
    if user.get("role") != "Administrator":
        permitted = con.execute("SELECT 1 FROM projects WHERE project_id=? AND officer_id=?", (row["project_id"], user.get("sub"))).fetchone()
        if not permitted and row["owner_id"] != user.get("sub"):
            con.close(); raise HTTPException(403, "You are not allowed to access this document")
    content = _decrypt_document(row["encrypted_blob"]); con.close()
    return Response(content=content, media_type=row["content_type"], headers={"Content-Disposition": f'attachment; filename="{row["filename"]}"', "X-Document-SHA256": row["sha256"]})

@app.post("/api/officer/projects/{pid}/users/{user_id}/verification")
def officer_verify_submission(pid: str, user_id: str, payload: ApprovalIn, user: dict = Depends(_current_user)):
    if user.get("role") not in ("Administrator", "Officer"):
        raise HTTPException(403, "Officer or administrator approval is required")
    decision = payload.decision if payload.decision in ("Approved", "Correction Required", "Rejected") else ""
    if not decision: raise HTTPException(400, "Choose Approved, Correction Required, or Rejected")
    con = db(); target = con.execute("SELECT 1 FROM affected_users WHERE project_id=? AND user_id=?", (pid, user_id)).fetchone()
    if not target: con.close(); raise HTTPException(404, "Landowner submission not found")
    status = "Verified" if decision == "Approved" else decision
    stage = "Further Process" if decision == "Approved" else "Correction Required"
    t = now()
    con.execute("UPDATE affected_users SET verification_status=?,current_stage=?,status=?,updated_at=? WHERE project_id=? AND user_id=?", (decision, stage, status, t, pid, user_id))
    con.execute("INSERT INTO officer_approvals(project_id,user_id,decision,notes,decided_at) VALUES(?,?,?,?,?)", (pid, user_id, decision, payload.notes, t))
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)", (user["sub"], "OFFICER_VERIFICATION_DECIDED", pid, f"{user_id}: {decision}. {payload.notes}".strip(), t))
    con.commit(); con.close(); return {"ok": True, "user_id": user_id, "verification_status": decision, "current_stage": stage}

@app.get("/api/officer/projects/{pid}/invitations")
def officer_list_invitations(pid:str, user: dict = Depends(_require_role("Officer", "Administrator"))):
    con=db(); rows=con.execute("SELECT * FROM invitations WHERE project_id=? ORDER BY id DESC",(pid,)).fetchall()
    out=[dict(r) for r in rows]; con.close(); return out

# ============================================================
# ALERTS MODULE
# Auto-created by Officer frontend after HIGH/CRITICAL ML result
# Visible to Admin as a proactive risk notification
# ============================================================

class AlertIn(BaseModel):
    project_id: str
    project_name: str
    risk_level: str
    risk_score: float = 0
    predicted_delay_days: float = 0
    top_driver: str = ""
    recommended_action: str = ""
    district: str = ""
    state: str = ""

@app.post("/api/alerts")
def create_alert(a: AlertIn, user: dict = Depends(_require_role("Administrator", "Officer"))):
    con = db()
    # Only create if no unresolved alert already exists for this project
    existing = con.execute(
        "SELECT id FROM alerts WHERE project_id=? AND status='Unresolved'", (a.project_id,)
    ).fetchone()
    if existing:
        con.close()
        return {"ok": True, "alert_id": existing["id"], "created": False, "msg": "Alert already exists"}
    t = now()
    cur = con.execute(
        """INSERT INTO alerts(project_id,project_name,risk_level,risk_score,predicted_delay_days,
           top_driver,recommended_action,district,state,status,created_at)
           VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (a.project_id, a.project_name, a.risk_level, a.risk_score, a.predicted_delay_days,
         a.top_driver, a.recommended_action, a.district, a.state, "Unresolved", t)
    )
    con.execute("INSERT INTO audit_log(actor,action,project_id,details,created_at) VALUES(?,?,?,?,?)",
                ("ML_ENGINE", "ALERT_CREATED", a.project_id,
                 f"{a.risk_level} risk alert raised — predicted delay {a.predicted_delay_days} days", t))
    con.commit()
    aid = cur.lastrowid
    con.close()
    return {"ok": True, "alert_id": aid, "created": True}

@app.get("/api/alerts")
def get_alerts(status: str | None = None):
    con = db()
    sql = "SELECT * FROM alerts"
    args = []
    if status:
        sql += " WHERE status=?"
        args.append(status)
    sql += " ORDER BY id DESC"
    rows = con.execute(sql, args).fetchall()
    out = [dict(r) for r in rows]
    con.close()
    return out

@app.get("/api/alerts/count")
def alert_count():
    con = db()
    c = con.execute("SELECT COUNT(*) c FROM alerts WHERE status='Unresolved'").fetchone()["c"]
    con.close()
    return {"unresolved": c}

@app.patch("/api/alerts/{aid}/resolve")
def resolve_alert(aid: int, user: dict = Depends(_require_role("Administrator", "Officer"))):
    con = db()
    r = con.execute("SELECT id FROM alerts WHERE id=?", (aid,)).fetchone()
    if not r:
        con.close(); raise HTTPException(404, "Alert not found")
    t = now()
    con.execute("UPDATE alerts SET status='Resolved',resolved_by='Admin',resolved_at=? WHERE id=?", (t, aid))
    con.commit(); con.close()
    return {"ok": True}

# ============================================================
# ANALYTICS MODULE
# Aggregates project data for Admin district/state dashboard
# ============================================================

@app.get("/api/analytics/summary")
def analytics_summary(user: dict = Depends(_require_role("Administrator", "Officer"))):
    con = db()
    projects = con.execute("SELECT * FROM projects").fetchall()

    district_map: dict = {}
    state_map: dict = {}
    risk_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0, "UNKNOWN": 0}
    type_map: dict = {}
    timeline_on_time = 0
    timeline_delayed = 0
    total_budget = 0.0
    total_area = 0.0

    for p in projects:
        d = dict(p)
        district = d.get("district") or "Unknown"
        state = d.get("state") or "Unknown"
        ptype = d.get("project_type") or "Other"
        priority = d.get("priority") or "Medium"
        budget = float(d.get("budget_inr") or 0)
        area = float(d.get("required_area_acres") or 0)
        total_budget += budget
        total_area += area

        # District aggregation
        if district not in district_map:
            district_map[district] = {"district": district, "count": 0, "total_area": 0, "high_risk": 0}
        district_map[district]["count"] += 1
        district_map[district]["total_area"] += area
        if priority in ("High", "Critical"):
            district_map[district]["high_risk"] += 1

        # State aggregation
        if state not in state_map:
            state_map[state] = {"state": state, "count": 0, "total_budget": 0, "districts": set()}
        state_map[state]["count"] += 1
        state_map[state]["total_budget"] += budget
        state_map[state]["districts"].add(district)

        # Risk distribution from alerts
        # Project type
        type_map[ptype] = type_map.get(ptype, 0) + 1

        # Timeline adherence
        start = d.get("start_date") or ""
        end = d.get("planned_completion_date") or ""
        if start and end:
            try:
                from datetime import date
                s = date.fromisoformat(start[:10])
                e = date.fromisoformat(end[:10])
                if e < date.today():
                    timeline_delayed += 1
                else:
                    timeline_on_time += 1
            except Exception:
                pass

    # Risk distribution from alerts table
    alert_rows = con.execute("SELECT risk_level, COUNT(*) c FROM alerts GROUP BY risk_level").fetchall()
    for row in alert_rows:
        lvl = row["risk_level"]
        if lvl in risk_dist:
            risk_dist[lvl] = row["c"]

    # Convert sets to counts for JSON serialisation
    state_list = []
    for s, v in state_map.items():
        state_list.append({
            "state": v["state"],
            "count": v["count"],
            "total_budget": round(v["total_budget"], 2),
            "district_count": len(v["districts"])
        })

    con.close()
    return {
        "total_projects": len(projects),
        "total_budget_inr": round(total_budget, 2),
        "total_area_acres": round(total_area, 2),
        "district_breakdown": sorted(district_map.values(), key=lambda x: x["count"], reverse=True),
        "state_breakdown": sorted(state_list, key=lambda x: x["count"], reverse=True),
        "risk_distribution": risk_dist,
        "project_type_breakdown": [{"type": k, "count": v} for k, v in sorted(type_map.items(), key=lambda x: x[1], reverse=True)],
        "timeline": {"on_time": timeline_on_time, "delayed": timeline_delayed,
                     "no_dates": len(projects) - timeline_on_time - timeline_delayed}
    }
