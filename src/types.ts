// ============================================================
// Unified Logging Types (Frontend + Backend)
// ============================================================

export type LogLevel = "LOG" | "INFO" | "WARN" | "ERROR" | "DEBUG" | "TRACE";
export type LogSource = "frontend" | "backend";

export interface UnifiedLogEntry {
  /** Log severity level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Additional structured data */
  data?: any;
  /** ISO timestamp string (serializable) */
  timestamp: string;
  /** Origin: frontend or backend */
  source: LogSource;
  /** Source file name where log was called */
  file?: string;
  /** Line number in source file */
  line?: number;
  /** Request ID for correlation (backend) */
  requestId?: string;
}

// ============================================================
// View & UI Types
// ============================================================

export type ViewState =
  | "landing"
  | "auth-candidate"
  | "auth-candidate-register"
  | "candidate-onboarding"
  | "candidate-dashboard"
  | "design-system"
  | "cv-analysis"
  | "privacy-policy";

export interface FloatingNodeProps {
  title: string;
  subtitle: string;
  detail: string;
  icon: string;
  position: string;
  delay: string;
  align?: "left" | "right";
  type: "cyan" | "indigo";
  tags?: string[];
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
}