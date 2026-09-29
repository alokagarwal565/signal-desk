const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('signaldesk_token');
}

export function setToken(token: string) {
  localStorage.setItem('signaldesk_token', token);
}

export function clearToken() {
  localStorage.removeItem('signaldesk_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || body.details?.map((d: { message: string }) => d.message).join(', ') || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; name: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    request<{ user: { id: string; email: string; name: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  // Companies
  getCompanies: () => request<{ companies: Company[] }>('/api/companies'),
  getCompany: (id: string) => request<{ company: Company }>(`/api/companies/${id}`),
  addCompany: (url: string) =>
    request<{ company: Company; isNew: boolean }>('/api/companies', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  updateCompany: (id: string, data: { name?: string | null; industry?: string | null; summary?: string | null }) =>
    request<{ company: Company }>(`/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteCompany: (id: string) =>
    request<{ success: boolean; company: Company }>(`/api/companies/${id}`, {
      method: 'DELETE',
    }),

  // Research
  startResearch: (companyId: string) =>
    request<{ jobId: string; status: string }>(`/api/companies/${companyId}/research`, {
      method: 'POST',
    }),
  getResearchStatus: (companyId: string) =>
    request<{ job: ResearchJob | null }>(`/api/companies/${companyId}/research/status`),

  // Intelligence
  getIntelligence: (companyId: string) =>
    request<{ intelligence: Intelligence | null }>(`/api/companies/${companyId}/intelligence`),

  // Signals
  getSignals: (companyId: string) =>
    request<{ signals: Signal[] }>(`/api/companies/${companyId}/signals`),

  // Opportunity
  getOpportunity: (companyId: string) =>
    request<{ opportunity: Opportunity | null }>(`/api/companies/${companyId}/opportunity`),

  // People
  getPeople: (companyId: string) =>
    request<{ people: Person[] }>(`/api/companies/${companyId}/people`),
  researchPeople: (companyId: string) =>
    request<{ people: Person[] }>(`/api/companies/${companyId}/people/research`, {
      method: 'POST',
    }),

  // Outreach
  getOutreach: (companyId: string) =>
    request<{ outreach: OutreachDraft | null; drafts: OutreachDraft[] }>(`/api/companies/${companyId}/outreach`),

  generateOutreach: (companyId: string, personId?: string) =>
    request<{ outreach: OutreachDraft }>(`/api/companies/${companyId}/outreach`, {
      method: 'POST',
      body: JSON.stringify({ personId }),
    }),

  // Snapshots
  getSnapshots: (companyId: string) =>
    request<{ snapshots: Snapshot[] }>(`/api/companies/${companyId}/snapshots`),

  // Changes
  getChanges: (companyId: string) =>
    request<{ changes: Change[] }>(`/api/companies/${companyId}/changes`),

  // Refresh
  refreshCompany: (companyId: string) =>
    request<{ jobId: string; status: string }>(`/api/companies/${companyId}/refresh`, {
      method: 'POST',
    }),

  // Dashboard
  getDashboard: () =>
    request<{ items: DashboardItem[]; generatedAt: string }>('/api/dashboard/today'),

  // Feedback
  sendFeedback: (data: { companyId?: string; targetType: string; targetId?: string; rating: string; comment?: string }) =>
    request<{ feedback: unknown }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Types ───────────────────────────────────────

export interface Company {
  id: string;
  userId: string;
  name: string | null;
  domain: string;
  url: string;
  industry: string | null;
  summary: string | null;
  lastResearchedAt: string | null;
  researchStatus: 'pending' | 'in_progress' | 'completed' | 'partial' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ResearchJob {
  id: string;
  companyId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'partial' | 'failed';
  progress: Record<string, string>;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Intelligence {
  id: string;
  companyId: string;
  data: {
    companyName: string;
    summary: string;
    industry: string;
    productsServices: string[];
    businessModel: string;
    targetCustomers: string;
    geographies: string[];
    companySizeIndicators: string;
    growthSignals: string[];
    recentDevelopments: string[];
    partnershipSignals: string[];
    hiringSignals: string[];
    leadershipSignals: string[];
    potentialOpportunity: string;
    potentialRisks: string[];
    keyEvidence: { fact: string; source?: string }[];
    confidence: string;
  };
  confidence: string;
  generatedAt: string;
}

export interface Signal {
  id: string;
  companyId: string;
  type: string;
  description: string;
  meaning: string | null;
  actionability: string | null;
  confidence: string;
  potentialImpact: string | null;
  detectedAt: string;
}

export interface Opportunity {
  id: string;
  companyId: string;
  totalScore: number;
  strategicFit: number;
  recentTrigger: number;
  growthSignal: number;
  reachability: number;
  evidenceConfidence: number;
  whyNow: string | null;
  explanation: string | null;
  confidence: string;
  calculatedAt: string;
}

export interface Person {
  id: string;
  companyId: string;
  name: string;
  role: string | null;
  profileUrl: string | null;
  whyRelevant: string | null;
  relevanceScore: number;
  persona: string | null;
  confidence: string;
}

export interface OutreachDraft {
  id: string;
  companyId: string;
  personId: string | null;
  message: string;
  context: string | null;
  version: number;
  createdAt: string;
}

export interface Snapshot {
  id: string;
  companyId: string;
  intelligenceData: unknown;
  signalsData: unknown;
  opportunityData: unknown;
  peopleData: unknown;
  evidenceCount: number;
  snapshotNumber: number;
  createdAt: string;
}

export interface Change {
  id: string;
  companyId: string;
  changeType: string;
  description: string;
  significance: string | null;
  actionability: string | null;
  recommendedAction: string | null;
  detectedAt: string;
}

export interface DashboardItem {
  company: {
    id: string;
    name: string | null;
    domain: string;
    industry: string | null;
  };
  opportunity: {
    totalScore: number;
    strategicFit: number;
    recentTrigger: number;
    growthSignal: number;
    reachability: number;
    evidenceConfidence: number;
    whyNow: string | null;
    confidence: string;
  } | null;
  strongestSignal: {
    type: string;
    description: string;
  } | null;
  topPerson: {
    name: string;
    role: string | null;
    whyRelevant: string | null;
  } | null;
  recommendedAction: string | null;
}
