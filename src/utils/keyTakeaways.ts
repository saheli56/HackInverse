import { LegalClause, RiskCategory } from "../types";

export interface KeyTakeaway {
  text: string;
  category: RiskCategory;
}

export function extractKeyTakeaways(clauses: LegalClause[]): KeyTakeaway[] {
  const takeaways: KeyTakeaway[] = [];

  const highRiskClauses = clauses.filter((c) => c.risk === "HIGH");

  highRiskClauses.forEach((clause) => {
    const summary = generateTakeaway(clause);
    if (summary) {
      takeaways.push({
        text: summary,
        category: clause.category,
      });
    }
  });

  return takeaways.slice(0, 5);
}

function generateTakeaway(clause: LegalClause): string | null {
  switch (clause.category) {
    case RiskCategory.DATA_PRIVACY:
      return "Your personal data may be sold to third parties";
    case RiskCategory.ARBITRATION:
      return "You cannot sue them in court";
    case RiskCategory.INDEMNIFICATION:
      return "You must pay their legal costs if they get sued";
    case RiskCategory.MODIFICATION:
      return "They can change terms without telling you";
    case RiskCategory.TERMINATION:
      return "They can ban you without explanation";
    case RiskCategory.LIABILITY:
      return "They are not responsible for damages";
    default:
      return null;
  }
}

export interface SuggestedQuestion {
  question: string;
  category: RiskCategory;
}

export function generateSuggestedQuestions(clauses: LegalClause[]): SuggestedQuestion[] {
  const categories = new Set(clauses.map((c) => c.category));
  const questions: SuggestedQuestion[] = [];

  if (categories.has(RiskCategory.DATA_PRIVACY)) {
    questions.push({
      question: "Can they share my data?",
      category: RiskCategory.DATA_PRIVACY,
    });
  }

  if (categories.has(RiskCategory.ARBITRATION)) {
    questions.push({
      question: "Can I sue them?",
      category: RiskCategory.ARBITRATION,
    });
  }

  if (categories.has(RiskCategory.TERMINATION)) {
    questions.push({
      question: "Can they cancel my account?",
      category: RiskCategory.TERMINATION,
    });
  }

  if (categories.has(RiskCategory.MODIFICATION)) {
    questions.push({
      question: "Can they change the terms?",
      category: RiskCategory.MODIFICATION,
    });
  }

  return questions.slice(0, 4);
}
