// ─────────────────────────────────────────────
// Work Item Types
// ─────────────────────────────────────────────

export enum WorkItemType {
  EPIC = 'EPIC',
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
}

export enum WorkItemStatus {
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  COMMITTED = 'COMMITTED',
  DONE = 'DONE',
  REMOVED = 'REMOVED',
}

export enum WorkItemPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
}

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  projectId: string;
  parentItemId?: string;
  assignedTo?: string;
  storyPoints?: number;
  githubMetadata?: GithubMetadata;
  aiSuggestedPriority?: number;
  aiSummary?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  children?: WorkItem[];
}

export interface GithubMetadata {
  githubPrUrl?: string;
  commitHash?: string;
  branchName?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Helpdesk / Ticket Types
// ─────────────────────────────────────────────

export enum SLAPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  BREACHED = 'BREACHED',
}

export enum SLAEventType {
  RESPONSE_DUE = 'RESPONSE_DUE',
  RESOLVE_DUE = 'RESOLVE_DUE',
  BREACH = 'BREACH',
}

export interface SLAConfig {
  responseHours: number;
  resolveHours: number;
}

export const SLA_CONFIGS: Record<SLAPriority, SLAConfig> = {
  [SLAPriority.CRITICAL]: { responseHours: 1, resolveHours: 4 },
  [SLAPriority.HIGH]: { responseHours: 4, resolveHours: 8 },
  [SLAPriority.MEDIUM]: { responseHours: 8, resolveHours: 24 },
  [SLAPriority.LOW]: { responseHours: 24, resolveHours: 72 },
};

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  contactEmail: string;
  priority: SLAPriority;
  status: TicketStatus;
  assignedAgentId?: string;
  linkedWorkItemId?: string;
  projectId?: string;
  slaResponseAt?: string;
  slaResolveAt?: string;
  slaStatus?: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  aiSummary?: string;
  aiSuggestedPriority?: SLAPriority;
  aiCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SLALog {
  id: string;
  ticketId: string;
  eventType: SLAEventType;
  triggeredAt: string;
  notifiedAgentId?: string;
}

// ─────────────────────────────────────────────
// Auth / RBAC Types
// ─────────────────────────────────────────────

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER',
}

export interface UserRole {
  id: string;
  clerkId: string;
  projectId: string;
  role: Role;
}

export interface AuthenticatedUser {
  clerkId: string;
  email: string;
  fullName: string;
  roles: UserRole[];
}

// ─────────────────────────────────────────────
// Redis Event Payloads
// ─────────────────────────────────────────────

export interface TriageEventPayload {
  id: string;
  title: string;
  description?: string;
  type: WorkItemType;
  projectId: string;
}

export interface TriageResultPayload {
  id: string;
  suggestedPriority: number;
  category: 'bug' | 'feature' | 'infra' | 'security' | 'unknown';
  confidence: number;
  summary: string;
}

// ─────────────────────────────────────────────
// API Response Wrappers
// ─────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  total: number;
  limit: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
