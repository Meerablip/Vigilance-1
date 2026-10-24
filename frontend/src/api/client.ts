const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const apiClient = {
  getToken: () => localStorage.getItem('vigilance_auth_token'),
  setToken: (token: string) => localStorage.setItem('vigilance_auth_token', token),
  clearToken: () => localStorage.removeItem('vigilance_auth_token'),

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = 'API Request failed';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) {
        /* empty */
      }
      throw new Error(errorDetail);
    }

    return response.json();
  },

  // Auth & MFA
  checkSystemStatus: () => apiClient.request<{
    is_initialized: boolean;
    recommended_admin_email: string;
    recommended_admin_name: string;
  }>('/auth/system-status'),

  bootstrapInit: () => apiClient.request<{
    mfa_secret: string;
    qr_code_base64: string;
    totp_uri: string;
    email: string;
    officer_name: string;
  }>('/auth/bootstrap-init', { method: 'POST' }),

  bootstrapComplete: (data: {
    email: string;
    officer_name: string;
    password: string;
    mfa_secret: string;
    totp_code: string;
  }) => apiClient.request<{
    message: string;
    access_token: string;
    user: any;
  }>('/auth/bootstrap-complete', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { email: string; password: string }) => apiClient.request<{
    mfa_required: boolean;
    temp_token: string;
    email: string;
    officer_name: string;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  verifyMfa: (data: { temp_token: string; totp_code: string }) => apiClient.request<{
    access_token: string;
    user: any;
  }>('/auth/verify-mfa', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  createInvite: (data: { role: string; sector: string; expiry_hours: number }) => apiClient.request<{
    invite_token: string;
    role: string;
    sector: string;
    expires_at: string;
  }>('/auth/invite/create', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  validateInvite: (token: string) => apiClient.request<{
    valid: boolean;
    role: string;
    sector: string;
  }>(`/auth/invite/validate/${token}`),

  getInviteMfaInit: (email: string) => apiClient.request<{
    mfa_secret: string;
    qr_code_base64: string;
    totp_uri: string;
  }>(`/auth/invite/mfa-init/${encodeURIComponent(email)}`),

  registerInvite: (data: {
    invite_token: string;
    email: string;
    officer_name: string;
    password: string;
    mfa_secret: string;
    totp_code: string;
  }) => apiClient.request<{
    message: string;
    access_token: string;
    user: any;
  }>('/auth/invite/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Incidents & Authorization
  getIncidents: () => apiClient.request<any[]>('/incidents/'),
  getIncident: (incidentId: string) => apiClient.request<any>(`/incidents/${incidentId}`),
  evaluateThreat: (data: {
    threat_level: string;
    confidence: number;
    location_id: string;
    summary: string;
    description: string;
    sensors_contributing: string[];
    sensor_disagreement?: boolean;
  }) => apiClient.request<any>('/incidents/evaluate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAuthorizationQueue: () => apiClient.request<any[]>('/authorizations/queue'),
  submitDecision: (authId: string, data: { 
    decision: string; 
    reason: string; 
    reviewer_identity: string;
    second_reviewer_identity?: string;
    second_reviewer_role?: string;
    destination_system?: string;
  }) => apiClient.request<any>(`/authorizations/${authId}/decide`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Connected Systems & Defense Messaging
  getConnectedSystemsStatus: () => apiClient.request<any[]>('/connected-systems/status'),
  getConnectedMessages: () => apiClient.request<any[]>('/connected-systems/messages'),
  pingConnectedSystem: (destination_system: string) => apiClient.request<any>('/connected-systems/ping', {
    method: 'POST',
    body: JSON.stringify({ destination_system }),
  }),
};
