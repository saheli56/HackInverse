import { 
  RiskLevel, 
  RiskCategory, 
  LegalClause, 
  DocumentType, 
  KeyTakeaway, 
  SuggestedQuestion,
  DocumentAnalysis 
} from "../types";

interface ClausePattern {
  patterns: RegExp[];
  category: RiskCategory;
  risk: RiskLevel;
  summary: string;
  takeaway: string;
  minConfidence: number;
}

const CLAUSE_PATTERNS: ClausePattern[] = [
  {
    patterns: [
      /we (may|can|will) (sell|share|transfer|provide|disclose) (your|user) (personal )?data/i,
      /(sell|share|transfer) your (personal )?information to third parties/i,
      /third[- ]party (access|use) (of|to) your data/i,
    ],
    category: RiskCategory.DATA_PRIVACY,
    risk: RiskLevel.HIGH,
    summary: "Your personal data may be shared with or sold to third parties.",
    takeaway: "Data may be shared with third parties",
    minConfidence: 0.85,
  },
  {
    patterns: [
      /by using .* you (agree|consent) to (binding )?arbitration/i,
      /waive .* right to (a |join a )?(class action|jury trial)/i,
      /disputes? .* resolved .* arbitration/i,
    ],
    category: RiskCategory.ARBITRATION,
    risk: RiskLevel.HIGH,
    summary: "You must resolve disputes through arbitration instead of court.",
    takeaway: "Arbitration required for disputes",
    minConfidence: 0.9,
  },
  {
    patterns: [
      /we (are|shall be) not (liable|responsible) for any (damages|loss)/i,
      /to the (fullest|maximum) extent permitted by law/i,
      /exclude all (warranties|liability)/i,
    ],
    category: RiskCategory.LIABILITY,
    risk: RiskLevel.MEDIUM,
    summary: "The company limits their responsibility for damages or losses.",
    takeaway: "Limited liability for damages",
    minConfidence: 0.8,
  },
  {
    patterns: [
      /we (may|can|reserve the right to) (modify|change|update) (these terms|this agreement)/i,
      /at our sole discretion/i,
      /without (prior )?notice/i,
    ],
    category: RiskCategory.MODIFICATION,
    risk: RiskLevel.MEDIUM,
    summary: "Terms can be changed without notifying you first.",
    takeaway: "Terms may change without notice",
    minConfidence: 0.75,
  },
  {
    patterns: [
      /we (may|can) terminate .* (at any time|without cause)/i,
      /suspend or terminate your account/i,
    ],
    category: RiskCategory.TERMINATION,
    risk: RiskLevel.MEDIUM,
    summary: "Your account can be terminated at any time without reason.",
    takeaway: "Account may be terminated anytime",
    minConfidence: 0.8,
  },
  {
    patterns: [
      /you (agree to|will|shall) indemnify (and hold harmless )?us/i,
      /indemnification/i,
    ],
    category: RiskCategory.INDEMNIFICATION,
    risk: RiskLevel.HIGH,
    summary: "You may be required to pay the company's legal costs.",
    takeaway: "You may cover their legal costs",
    minConfidence: 0.85,
  },
  {
    patterns: [
      /provided ['""]as is['""] (and )?['""]as available['""]?/i,
      /without (warranties|guarantees) of any kind/i,
      /no warranty/i,
    ],
    category: RiskCategory.WARRANTY,
    risk: RiskLevel.LOW,
    summary: "Service is provided without any guarantees about quality.",
    takeaway: "No quality guarantees",
    minConfidence: 0.7,
  },
  {
    patterns: [
      /auto[- ]?renew/i,
      /automatic(ally)? renew/i,
      /subscription.* will (automatically )?renew/i,
      /recurring (payment|charge|billing)/i,
    ],
    category: RiskCategory.BILLING,
    risk: RiskLevel.MEDIUM,
    summary: "Subscription renews automatically and charges will continue.",
    takeaway: "Subscription auto-renews",
    minConfidence: 0.85,
  },
  {
    patterns: [
      /no refund/i,
      /refunds? (are|will) not (be )?(given|provided|available)/i,
      /non[- ]?refundable/i,
      /cancel.* (no|without) refund/i,
    ],
    category: RiskCategory.CANCELLATION,
    risk: RiskLevel.HIGH,
    summary: "No refunds are provided after purchase or cancellation.",
    takeaway: "No refunds after cancellation",
    minConfidence: 0.9,
  },
];

const DOCUMENT_TYPE_PATTERNS: { type: DocumentType; patterns: RegExp[] }[] = [
  {
    type: DocumentType.TERMS_OF_SERVICE,
    patterns: [/terms of (service|use)/i, /terms and conditions/i, /user agreement/i],
  },
  {
    type: DocumentType.PRIVACY_POLICY,
    patterns: [/privacy policy/i, /privacy notice/i, /data (protection|privacy)/i],
  },
  {
    type: DocumentType.COOKIE_POLICY,
    patterns: [/cookie policy/i, /cookie notice/i],
  },
];

const DEFAULT_QUESTIONS: { question: string; category: RiskCategory }[] = [
  { question: "What happens if I cancel?", category: RiskCategory.CANCELLATION },
  { question: "Can they share my data?", category: RiskCategory.DATA_PRIVACY },
  { question: "Can I sue them?", category: RiskCategory.ARBITRATION },
  { question: "Will I be charged automatically?", category: RiskCategory.BILLING },
];

export function detectDocumentType(text: string): DocumentType {
  for (const { type, patterns } of DOCUMENT_TYPE_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return type;
      }
    }
  }
  return DocumentType.UNKNOWN;
}

export function detectClauses(text: string): LegalClause[] {
  const clauses: LegalClause[] = [];
  const sentences = extractSentences(text);

  sentences.forEach((sentence, index) => {
    for (const pattern of CLAUSE_PATTERNS) {
      for (const regex of pattern.patterns) {
        if (regex.test(sentence.text)) {
          clauses.push({
            id: `clause-${Date.now()}-${index}`,
            text: sentence.text,
            summary: pattern.summary,
            risk: pattern.risk,
            category: pattern.category,
            confidence: pattern.minConfidence,
            position: sentence.position,
          });
          break;
        }
      }
    }
  });

  return deduplicateClauses(clauses);
}

export function generateTakeaways(clauses: LegalClause[]): KeyTakeaway[] {
  const seenCategories = new Set<RiskCategory>();
  const takeaways: KeyTakeaway[] = [];

  const sortedClauses = [...clauses].sort((a, b) => {
    const riskOrder = { [RiskLevel.HIGH]: 0, [RiskLevel.MEDIUM]: 1, [RiskLevel.LOW]: 2 };
    return riskOrder[a.risk] - riskOrder[b.risk];
  });

  for (const clause of sortedClauses) {
    if (!seenCategories.has(clause.category)) {
      seenCategories.add(clause.category);
      const pattern = CLAUSE_PATTERNS.find((p) => p.category === clause.category);
      if (pattern) {
        takeaways.push({
          id: `takeaway-${clause.category}`,
          text: pattern.takeaway,
          risk: clause.risk,
          category: clause.category,
        });
      }
    }
  }

  return takeaways.slice(0, 5);
}

export function generateQuestions(clauses: LegalClause[]): SuggestedQuestion[] {
  const relevantCategories = new Set(clauses.map((c) => c.category));
  
  return DEFAULT_QUESTIONS
    .filter((q) => relevantCategories.has(q.category))
    .slice(0, 4)
    .map((q, index) => ({
      id: `question-${index}`,
      question: q.question,
      answer: "",
      category: q.category,
    }));
}

export function calculateOverallRisk(clauses: LegalClause[]): RiskLevel {
  const highRiskCount = clauses.filter((c) => c.risk === RiskLevel.HIGH).length;
  const mediumRiskCount = clauses.filter((c) => c.risk === RiskLevel.MEDIUM).length;

  if (highRiskCount >= 2) return RiskLevel.HIGH;
  if (highRiskCount >= 1 || mediumRiskCount >= 3) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

export function analyzeDocument(text: string): DocumentAnalysis {
  const documentType = detectDocumentType(text);
  const clauses = detectClauses(text);
  const takeaways = generateTakeaways(clauses);
  const questions = generateQuestions(clauses);
  const overallRisk = calculateOverallRisk(clauses);

  return {
    documentType,
    overallRisk,
    takeaways,
    clauses,
    questions,
    summary: {
      totalClauses: clauses.length,
      highRisk: clauses.filter((c) => c.risk === RiskLevel.HIGH).length,
      mediumRisk: clauses.filter((c) => c.risk === RiskLevel.MEDIUM).length,
      lowRisk: clauses.filter((c) => c.risk === RiskLevel.LOW).length,
    },
  };
}

interface Sentence {
  text: string;
  position: {
    start: number;
    end: number;
  };
}

function extractSentences(text: string): Sentence[] {
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const sentences: Sentence[] = [];
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    sentences.push({
      text: match[0].trim(),
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
    });
  }

  return sentences;
}

function deduplicateClauses(clauses: LegalClause[]): LegalClause[] {
  const seen = new Set<string>();
  return clauses.filter((clause) => {
    const key = `${clause.category}-${clause.position.start}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function scanPage(): string {
  return document.body.innerText;
}
