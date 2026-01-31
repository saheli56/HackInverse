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
}

export interface LegalClause {
  id: string;
  text: string;
  risk: RiskLevel;
  category: RiskCategory;
  confidence: number;
  position: {
    start: number;
    end: number;
  };
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

export interface ScanResult {
  clauses: LegalClause[];
  summary: {
    totalClauses: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}
