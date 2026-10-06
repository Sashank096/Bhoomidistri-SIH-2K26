# BhoomiDrishti Prototype Integration

The ZIP prototype was reviewed as a separate reference. Its most valuable production-shaped features are now available in this working directory:

- `backend/` contains the shared FastAPI + SQLite workflow for projects, parcel matching, validation, publishing, audit history, alerts, operational uploads, landowner accounts, and invitation links.
- `data/BhoomiDrishti_Dataset.xlsx` is the registry workbook used to seed the backend.
- `ml_service/` contains the FastAPI prediction service, pinned requirements, model artifacts, feature list, scaler, and technical notes.
- `src/services/landAcquisitionApi.ts` provides one frontend contract for the shared backend and ML service.

## Recommended User Flow

1. The administrator lands on the secure government login and MFA screens, then sees the portfolio dashboard.
2. Dashboard KPIs lead to Projects, GIS Registry, Alerts, and Analytics. The primary action is `Create Project`.
3. Project creation is a progressive wizard: identity and location, requirements and compensation, GIS boundary, registry parcel matching, then readiness review.
4. Readiness is explicit. Blocking validation errors stop publication; advisory warnings remain visible and explain the next best action.
5. `Assign & Publish` makes the same project record available in the Officer workspace. The project ID is the shared identity across every dataset and audit entry.
6. The officer selects a published project, downloads its sample workbook, uploads current operational status, and sees row-level validation before analysis.
7. `Analyze Data` is enabled only after a valid upload. The ML result opens with overall risk, expected delay, stage risks, contributing factors, and recommended interventions.
8. The officer creates landowner accounts and generates project- and parcel-specific share links. The landowner handoff starts with consent, document verification, correction/re-upload, and acquisition status.

## Start Locally

Use three terminals from the project root:

```powershell
# Terminal 1
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Terminal 2
cd ml_service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8001

# Terminal 3
npm install
npm run dev
```

Optional frontend variables are documented in `.env.example`:

- `VITE_BHOOMIDRISHTI_API_URL` defaults to `http://localhost:8000/api`.
- `VITE_BHOOMIDRISHTI_ML_URL` defaults to `http://localhost:8001/api/officer/ml`.
- `VITE_GOOGLE_MAPS_API_KEY` is a browser-restricted Google Maps key. Restrict it by local/deployed HTTP referrer and enable only the Maps JavaScript API.

The GIS map does not hardcode the key. The frontend key is only a restricted rendering key; project boundaries and parcel updates go through the backend, where production deployments should enforce the authenticated user and project permissions. The existing login/MFA flow must complete before map editing is unlocked. For production, enforce that same check server-side on `PUT /api/projects/{pid}/boundary` rather than relying on the browser control.

## UI Refinement Principles

- Keep one persistent project context bar with project ID, state/district, publication state, data freshness, and validation state.
- Use the left navigation for modules and a compact project stepper for lifecycle work; do not mix administrative navigation with data-entry steps.
- Surface integrity issues beside the affected section and in a single readiness summary. Every issue should identify the record, reason, and suggested fix.
- Treat the GIS map as a decision tool: selected parcels, unmatched parcels, overlap warnings, and area totals should remain synchronized with the project form.
- Use calm government green and warm gold for trust, amber for advisory risks, and red only for blockers or critical delay risk. Preserve keyboard focus, table sorting, and mobile drawer navigation.
