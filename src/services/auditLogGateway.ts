export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  result: 'SUCCESS' | 'FAILED' | 'INFO';
  details: string;
  timestamp: string;
}

const API_BASE = import.meta.env.VITE_BHOOMIDRISHTI_API_URL || 'http://localhost:8000/api';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = sessionStorage.getItem('bhoomidrishti_access_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    // Silently fail — audit recording should never block user actions
    return [] as unknown as T;
  }
  return response.json() as Promise<T>;
}

/** Write an audit entry to the server. Falls back to no-op on network failure. */
export async function recordAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    await apiRequest('/audit', {
      method: 'POST',
      body: JSON.stringify({
        actor: entry.actor,
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entityId,
        result: entry.result,
        details: entry.details,
      }),
    });
  } catch {
    // Audit failures are silent to avoid disrupting the user experience.
  }
}

/** Fetch audit entries from the server for a specific project. */
export async function readAuditEntries(projectId?: string): Promise<AuditEntry[]> {
  try {
    const path = projectId ? `/audit?project_id=${encodeURIComponent(projectId)}` : '/audit';
    const entries = await apiRequest<AuditEntry[]>(path);
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

/** Fetch audit entries for a specific project from the backend. */
export async function readProjectAudit(projectId: string): Promise<AuditEntry[]> {
  try {
    return await apiRequest<AuditEntry[]>(`/projects/${encodeURIComponent(projectId)}/audit`);
  } catch {
    return [];
  }
}
