import { RiskLevel, LegalClause } from "../types";

export type DocumentType = 
  | "Terms of Service"
  | "Privacy Policy"
  | "End User License Agreement"
  | "Cookie Policy"
  | "Refund Policy"
  | "Subscription Agreement"
  | "Legal Document";

export function detectDocumentType(): DocumentType {
  const title = document.title.toLowerCase();
  const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
    .map((el) => el.textContent?.toLowerCase() || "")
    .join(" ");

  const text = `${title} ${headings}`.toLowerCase();

  if (text.includes("privacy") || text.includes("data protection")) {
    return "Privacy Policy";
  }
  if (text.includes("eula") || text.includes("end user license")) {
    return "End User License Agreement";
  }
  if (text.includes("cookie")) {
    return "Cookie Policy";
  }
  if (text.includes("refund") || text.includes("return")) {
    return "Refund Policy";
  }
  if (text.includes("subscription")) {
    return "Subscription Agreement";
  }
  if (text.includes("terms") || text.includes("conditions")) {
    return "Terms of Service";
  }

  return "Legal Document";
}

export function calculateOverallRisk(clauses: LegalClause[]): RiskLevel {
  if (clauses.length === 0) return RiskLevel.LOW;

  const highRiskCount = clauses.filter((c) => c.risk === RiskLevel.HIGH).length;
  const mediumRiskCount = clauses.filter((c) => c.risk === RiskLevel.MEDIUM).length;

  if (highRiskCount >= 3) return RiskLevel.HIGH;
  if (highRiskCount >= 1) return RiskLevel.MEDIUM;
  if (mediumRiskCount >= 4) return RiskLevel.MEDIUM;

  return RiskLevel.LOW;
}
