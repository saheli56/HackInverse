import { FileText } from "lucide-react";
import { DocumentAnalysis, DocumentType, RiskLevel, LegalClause, SuggestedQuestion } from "../types";
import { Header } from "./Header";
import { KeyTakeaways } from "./KeyTakeaways";
import { ClauseList } from "./ClauseList";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { VoiceAssist } from "./VoiceAssist";

interface AnalysisProps {
  analysis: DocumentAnalysis | null;
  isScanning: boolean;
  onScan: () => void;
  expandedClauseId: string | null;
  clauseExplanation: string | null;
  isExplaining: boolean;
  onExplainClause: (clause: LegalClause) => void;
  questions: SuggestedQuestion[];
  onAskQuestion: (question: SuggestedQuestion) => void;
  isLoadingAnswer: boolean;
  isListening: boolean;
  onVoiceToggle: () => void;
  onSpeak: (text: string) => void;
  voiceText: string | null;
}

export function Analysis({
  analysis,
  isScanning,
  onScan,
  expandedClauseId,
  clauseExplanation,
  isExplaining,
  onExplainClause,
  questions,
  onAskQuestion,
  isLoadingAnswer,
  isListening,
  onVoiceToggle,
  onSpeak,
  voiceText,
}: AnalysisProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Header
        documentType={analysis?.documentType || DocumentType.UNKNOWN}
        overallRisk={analysis?.overallRisk || RiskLevel.LOW}
        isScanning={isScanning}
        onScan={onScan}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {!analysis && !isScanning && (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <FileText size={40} color="#d4d4d4" />
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#737373",
                lineHeight: "1.5",
              }}
            >
              Click "Analyze This Page" to scan for risky clauses in this legal document.
            </p>
          </div>
        )}

        {analysis && (
          <>
            <KeyTakeaways takeaways={analysis.takeaways} />

            <ClauseList
              clauses={analysis.clauses}
              onExplain={onExplainClause}
              expandedClauseId={expandedClauseId}
              explanation={clauseExplanation}
              isExplaining={isExplaining}
            />

            <SuggestedQuestions
              questions={questions}
              onAsk={onAskQuestion}
              isLoading={isLoadingAnswer}
            />
          </>
        )}
      </div>

      <VoiceAssist
        isListening={isListening}
        onToggle={onVoiceToggle}
        onSpeak={onSpeak}
        lastText={voiceText}
      />
    </div>
  );
}
