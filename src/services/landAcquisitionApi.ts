const API_BASE = import.meta.env.VITE_BHOOMIDRISHTI_API_URL || 'http://localhost:8000/api';
const ML_BASE = import.meta.env.VITE_BHOOMIDRISHTI_ML_URL || 'http://localhost:8001/api/officer/ml';

export interface ProjectApiRecord {
  project_id: string;
  project_name: string;
  status: 'Draft' | 'Published' | 'Reference';
  state: string;
  district: string;
  project_type?: string;
  department?: string;
  village?: string;
  mandal_taluk?: string;
  start_date?: string;
  planned_completion_date?: string;
  description?: string;
  target_parcels: number;
  matched_parcels?: number;
  budget_inr?: number;
  required_area_acres?: number;
  officer_id?: string;
  created_at?: string;
  updated_at?: string;
  risk_assessment?: {
    risk_level?: string;
    predicted_delay_days?: number;
  };
  priority: string;
}

export interface ValidationApiResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  [key: string]: unknown;
}

export interface LandownerInviteRecord {
  project_id: string;
  project_name: string;
  project_type: string;
  state: string;
  district: string;
  mandal_taluk: string;
  village: string;
  parcel_id: string;
  name: string;
  mobile: string;
  land_area_acres: number;
  current_stage: string;
  consent_status: string;
  document_status: string;
  verification_status: string;
  final_outcome: string;
  documents: string[];
  compensation_rate_inr_per_acre: number;
  compensation_rate_type: string;
  [key: string]: unknown;
}

export interface AuthLoginResponse {
  challenge_id: string;
  delivery: string;
  development_otp?: string;
  user?: { username: string; role: string; full_name: string };
}

export interface AuthVerifyResponse {
  access_token: string;
  token_type: string;
  user: { username: string; role: string; full_name: string };
}

export interface OperationalUploadResult {
  rows_matched?: number;
  rows_skipped?: number;
  analysis?: Record<string, unknown> | null;
  [key: string]: unknown;
}

async function request<T>(base: string, path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const accessToken = sessionStorage.getItem('bhoomidrishti_access_token');
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof payload.detail === 'string' ? payload.detail : 'BhoomiDrishti service request failed';
    throw new Error(detail);
  }
  return payload as T;
}

export const landAcquisitionApi = {
  health: () => request<{ ok: boolean }>(API_BASE, '/health'),
  login: (username: string, password: string) => request<AuthLoginResponse>(API_BASE, '/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  verifyOtp: (challenge_id: string, otp: string) => request<AuthVerifyResponse>(API_BASE, '/auth/verify-otp', { method: 'POST', body: JSON.stringify({ challenge_id, otp }) }),
  logout: (token: string) => request<{ ok: boolean }>(API_BASE, '/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  listProjects: () => request<ProjectApiRecord[]>(API_BASE, '/projects'),
  getProject: (projectId: string) => request<ProjectApiRecord>(API_BASE, `/projects/${encodeURIComponent(projectId)}`),
  validateProject: (projectId: string) => request<ValidationApiResult>(API_BASE, `/projects/${encodeURIComponent(projectId)}/validation`),
  publishProject: (projectId: string) => request<{ ok: boolean }>(API_BASE, `/projects/${encodeURIComponent(projectId)}/publish`, { method: 'POST' }),
  searchRegistry: (query = '') => request<unknown[]>(API_BASE, `/registry/parcels?q=${encodeURIComponent(query)}`),
  updateBoundary: (projectId: string, boundary_geojson: Record<string, unknown>, mapped_area_acres = 0) => request<{ ok: boolean }>(API_BASE, `/projects/${encodeURIComponent(projectId)}/boundary`, { method: 'PUT', body: JSON.stringify({ boundary_geojson, mapped_area_acres }) }),
  officerDashboard: () => request<ProjectApiRecord[]>(API_BASE, '/officer/dashboard'),
  getOfficerProject: (projectId: string) => request<Record<string, unknown>>(API_BASE, `/officer/projects/${encodeURIComponent(projectId)}`),
  uploadOperationalWorkbook: (projectId: string, file: File) => {
    const body = new FormData();
    body.append('file', file);
    return request<OperationalUploadResult>(API_BASE, `/officer/projects/${encodeURIComponent(projectId)}/excel`, { method: 'POST', body }).then(async (upload) => {
      // Keep the operational snapshot and ML snapshot tied to the same project ID.
      let analysis: Record<string, unknown> | null = null;
      try {
        analysis = await landAcquisitionApi.analyzeWorkbook(projectId, file);
        await landAcquisitionApi.saveRiskAssessment(projectId, analysis);
      } catch { /* ML service can be started independently. */ }
      return { ...upload, analysis };
    });
  },
  analyzeWorkbook: (projectId: string, file: File) => {
    const body = new FormData();
    body.append('file', file);
    body.append('project_id', projectId);
    return request<Record<string, unknown>>(ML_BASE, '/upload-risk', { method: 'POST', body });
  },
  saveRiskAssessment: (projectId: string, assessment: Record<string, unknown>) => request<Record<string, unknown>>(API_BASE, `/projects/${encodeURIComponent(projectId)}/risk-assessment`, { method: 'PUT', body: JSON.stringify(assessment) }),
  getRiskAssessment: (projectId: string) => request<Record<string, unknown>>(API_BASE, `/projects/${encodeURIComponent(projectId)}/risk-assessment`),
  createLandownerAccounts: (projectId: string) => request<Record<string, unknown>>(API_BASE, `/officer/projects/${encodeURIComponent(projectId)}/accounts`, { method: 'POST' }),
  createShareLinks: (projectId: string) => request<Record<string, unknown>>(API_BASE, `/officer/projects/${encodeURIComponent(projectId)}/invitations`, { method: 'POST' }),
  getLandownerInvite: (token: string) => request<LandownerInviteRecord>(API_BASE, `/landowner/invite/${encodeURIComponent(token)}`),
  updateLandownerConsent: (token: string, decision: 'Accepted' | 'Correction Required') => request<Record<string, unknown>>(API_BASE, `/landowner/invite/${encodeURIComponent(token)}/consent`, { method: 'POST', body: JSON.stringify({ decision }) }),
  submitLandownerDocuments: (token: string, documents: string[]) => request<Record<string, unknown>>(API_BASE, `/landowner/invite/${encodeURIComponent(token)}/documents`, { method: 'POST', body: JSON.stringify({ documents }) }),
  submitLandownerCase: (token: string) => request<Record<string, unknown>>(API_BASE, `/landowner/invite/${encodeURIComponent(token)}/submit`, { method: 'POST' }),
};
