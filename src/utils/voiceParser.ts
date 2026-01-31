import { VoiceIntent, VoiceCommand } from "../types";

const INTENT_PATTERNS: Record<VoiceIntent, RegExp[]> = {
  [VoiceIntent.SCAN_PAGE]: [
    /scan (the |this )?page/i,
    /check (the |this )?page/i,
    /analyze (the |this )?(page|document)/i,
    /find (risky )?clauses/i,
  ],
  [VoiceIntent.EXPLAIN_CLAUSE]: [
    /explain (the |this |that )?clause/i,
    /what does (this|that) mean/i,
    /tell me (about|more)/i,
  ],
  [VoiceIntent.LIST_RISKS]: [
    /list (the |all )?risks/i,
    /show (me )?(the )?risks/i,
    /what (are the )?risks/i,
  ],
  [VoiceIntent.HELP]: [
    /help/i,
    /what can you do/i,
    /how (does this|do you) work/i,
  ],
  [VoiceIntent.UNKNOWN]: [],
};

export function parseVoiceCommand(rawText: string): VoiceCommand {
  const normalized = rawText.trim().toLowerCase();

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return {
          intent: intent as VoiceIntent,
          rawText,
        };
      }
    }
  }

  return {
    intent: VoiceIntent.UNKNOWN,
    rawText,
  };
}
