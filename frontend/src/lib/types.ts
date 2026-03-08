// ===== User & Auth =====
export type Role = "ADMIN" | "KAPRODI" | "DOSEN" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  nidn?: string;
  department?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
  nidn?: string;
  department?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ===== API Response Wrapper =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

// ===== IKU =====
export interface IkuData {
  id: string;
  criteriaNo: number;
  indicator: string;
  target: number;
  current: number;
  percentage: number;
  status: string;
  year: number;
  semester?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIkuRequest {
  criteriaNo: number;
  indicator: string;
  target: number;
  current: number;
  year: number;
  semester?: string;
  notes?: string;
}

export type UpdateIkuRequest = Partial<CreateIkuRequest>;

// ===== Research =====
export type PublicationType = "JOURNAL" | "CONFERENCE" | "BOOK" | "CHAPTER";

export interface Publication {
  id: string;
  title: string;
  abstract?: string;
  journal: string;
  sintaLevel?: number;
  doi?: string;
  year: number;
  citations?: number;
  type: PublicationType;
  lecturerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicationRequest {
  title: string;
  abstract?: string;
  journal: string;
  sintaLevel?: number;
  doi?: string;
  year: number;
  citations?: number;
  type: PublicationType;
}

export type GrantStatus = "SUBMITTED" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface ResearchGrant {
  id: string;
  title: string;
  source: string;
  amount: number;
  year: number;
  status: GrantStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGrantRequest {
  title: string;
  source: string;
  amount: number;
  year: number;
  status?: GrantStatus;
}

export type HkiStatus = "PENDING" | "REGISTERED" | "GRANTED";

export interface Hki {
  id: string;
  title: string;
  type: string;
  regNumber?: string;
  year: number;
  status: HkiStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHkiRequest {
  title: string;
  type: string;
  regNumber?: string;
  year: number;
  status?: HkiStatus;
}

// ===== Accreditation =====
export interface AccreditationScore {
  id: string;
  criteriaNo: number;
  criteriaName: string;
  score: number;
  maxScore: number;
  year: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScoreRequest {
  criteriaNo: number;
  criteriaName: string;
  score: number;
  maxScore?: number;
  year: number;
  notes?: string;
}

export interface UpdateScoreRequest {
  score: number;
  notes?: string;
}

export interface AccreditationReadiness {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  scores: AccreditationScore[];
}

// ===== Risk =====
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskAlert {
  id: string;
  criteriaNo: number;
  level: RiskLevel;
  message: string;
  recommendation?: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRiskAlertRequest {
  criteriaNo: number;
  level: RiskLevel;
  message: string;
  recommendation?: string;
}

// ===== LED =====
export interface LedJob {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress?: number;
  downloadUrl?: string;
  createdAt: string;
}

export interface GenerateLedRequest {
  criteria: number[];
  year: number;
  format?: string;
}
