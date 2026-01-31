import { RiskLevel, RiskCategory, LegalClause } from "../types";

interface ClausePattern {
  patterns: RegExp[];
  category: RiskCategory;
  risk: RiskLevel;
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
    minConfidence: 0.75,
  },
  {
    patterns: [
      /we (may|can) terminate .* (at any time|without cause)/i,
      /suspend or terminate your account/i,
    ],
    category: RiskCategory.TERMINATION,
    risk: RiskLevel.MEDIUM,
    minConfidence: 0.8,
  },
  {
    patterns: [
      /you (agree to|will|shall) indemnify (and hold harmless )?us/i,
      /indemnification/i,
    ],
    category: RiskCategory.INDEMNIFICATION,
    risk: RiskLevel.HIGH,
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
    minConfidence: 0.7,
  },
];

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
  const bodyText = document.body.innerText;
  return bodyText;
}
