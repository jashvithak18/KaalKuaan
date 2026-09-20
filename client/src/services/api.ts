import { Well, ComplianceRecord, AuditLogEntry, StatisticsData, UserProfile } from '../types';
const DEFAULT_PROD_API = 'https://kaalkuaan.onrender.com';
const API_BASE = (
  import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
    : (import.meta.env.PROD && typeof window !== 'undefined' && !window.location.hostname.includes('onrender.com')
        ? DEFAULT_PROD_API
        : '')
) + '/api';

export const api = {
  // Wells
  getWells: async (params?: { mandal?: string; village?: string; status?: string; riskLevel?: string; search?: string }): Promise<Well[]> => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/wells?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  getWellById: async (id: string): Promise<Well> => {
    const res = await fetch(`${API_BASE}/wells/${id}`);
    const json = await res.json();
    return json.data;
  },

  getStatistics: async (): Promise<StatisticsData> => {
    const res = await fetch(`${API_BASE}/wells/statistics`);
    const json = await res.json();
    return json.data;
  },

  verifyWell: async (wellId: string, payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/wells/${wellId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  updateWellStatus: async (wellId: string, payload: { status: string; actor?: string; cappingPhotoUrl?: string; remarks?: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/wells/${wellId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  submitCitizenReport: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/wells/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  submitWhatsAppSim: async (payload: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/wells/whatsapp-sim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Compliance
  getCompliances: async (params?: { status?: string; mandal?: string }): Promise<ComplianceRecord[]> => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/compliance?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  issueNotice: async (complianceId: string, payload: { noticeReferenceNumber?: string; deadline?: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/compliance/${complianceId}/notice`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Public Map
  getPublicMap: async (params?: { lat?: number; lng?: number; search?: string }): Promise<any> => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/public/map?${query}`);
    return await res.json();
  },

  // Audit
  getAuditLogs: async (wellId?: string): Promise<AuditLogEntry[]> => {
    const url = wellId ? `${API_BASE}/audit?wellId=${wellId}` : `${API_BASE}/audit`;
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
  },

  // Auth & Roles
  getUsers: async (): Promise<UserProfile[]> => {
    const res = await fetch(`${API_BASE}/auth/users`);
    const json = await res.json();
    return json.data || [];
  },

  switchRole: async (role: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return await res.json();
  },

  login: async (email: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  },

  signup: async (payload: { name: string; email: string; phone?: string; district?: string; mandal?: string; village?: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  getMe: async (userId?: string): Promise<any> => {
    const url = userId ? `${API_BASE}/auth/me?userId=${userId}` : `${API_BASE}/auth/me`;
    const res = await fetch(url);
    return await res.json();
  },

  // Reports
  getMyReports: async (userId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/reports/my-reports?userId=${encodeURIComponent(userId)}`);
    return await res.json();
  },

  submitHazardReport: async (payload: {
    userId: string;
    hazardType: string;
    area: string;
    coordinates: { lat: number; lng: number };
    photo?: string;
    description: string;
    wellId?: string;
  }): Promise<any> => {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  updateReportStatus: async (reportId: string, status: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // Demo Control
  resetDemo: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST'
    });
    return await res.json();
  },

  // AI Safety Assistant
  askSafetyAssistant: async (payload: {
    message?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    userLocation?: { lat: number; lng: number } | null;
    locationName?: string;
    hasPermission?: boolean;
    currentAlert?: any;
    userReports?: any[];
    action?: string;
    reportDraft?: any;
  }): Promise<{
    success: boolean;
    reply: string;
    suggestedActions?: Array<{
      type: 'VIEW_ON_MAP' | 'VIEW_HAZARD' | 'REPORT_HAZARD' | 'CONFIRM_REPORT' | 'ENABLE_LOCATION';
      label: string;
      payload?: any;
    }>;
    reportDraft?: any;
    submittedReport?: any;
  }> => {
    const res = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};

