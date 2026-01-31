export enum RiskLevel {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum RiskCategory {
  DATA_PRIVACY = "DATA_PRIVACY",
  LIABILITY = "LIABILITY",
  ARBITRATION = "ARBITRATION",
  JURISDICTION = "JURISDICTION",
  TERMINATION = "TERMINATION",
  MODIFICATION = "MODIFICATION",
  WARRANTY = "WARRANTY",
  INDEMNIFICATION = "INDEMNIFICATION",
  BILLING = "BILLING",
  CANCELLATION = "CANCELLATION",
}

export enum DocumentType {
  TERMS_OF_SERVICE = "Terms of Service",
  PRIVACY_POLICY = "Privacy Policy",
  USER_AGREEMENT = "User Agreement",
  COOKIE_POLICY = "Cookie Policy",
  UNKNOWN = "Legal Document",
}

export interface LegalClause {
  id: string;
  text: string;
  summary: string;
  risk: RiskLevel;
  category: RiskCategory;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
}

export interface KeyTakeaway {
  id: string;
  text: string;
  risk: RiskLevel;
  category: RiskCategory;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  answer: string;
  category: RiskCategory;
}

export interface ClauseExplanation {
  clauseId: string;
  plainEnglish: string;
  risks: string[];
  alternatives: string[];
}

export enum VoiceIntent {
  SCAN_PAGE = "SCAN_PAGE",
  EXPLAIN_CLAUSE = "EXPLAIN_CLAUSE",
  LIST_RISKS = "LIST_RISKS",
  HELP = "HELP",
  UNKNOWN = "UNKNOWN",
}

export interface VoiceCommand {
  intent: VoiceIntent;
  params?: Record<string, string>;
  rawText: string;
}

export interface LLMResponse {
  explanation: string;
  risks: string[];
  alternatives: string[];
}

export interface DocumentAnalysis {
  documentType: DocumentType;
  overallRisk: RiskLevel;
  takeaways: KeyTakeaway[];
  clauses: LegalClause[];
  questions: SuggestedQuestion[];
  summary: {
    totalClauses: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

export interface ScanResult {
  clauses: LegalClause[];
  summary: {
    totalClauses: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface PresetPrompt {
  id: string;
  label: string;
  prompt: string;
}
