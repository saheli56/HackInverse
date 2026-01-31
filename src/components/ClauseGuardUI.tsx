import { useState, useEffect, useRef } from "react";
import { 
  DocumentType, 
  RiskLevel, 
  LegalClause, 
  DocumentAnalysis,
  SuggestedQuestion,
} from "../types";
import { VoiceInterface } from "../services/voiceInterface";
import { LLMService } from "../services/llmService";
import { analyzeDocument, scanPage } from "../utils/clauseDetector";
import { getApiKeys } from "../utils/storage";
import { Header } from "./Header";
import { KeyTakeaways } from "./KeyTakeaways";
import { ClauseList } from "./ClauseList";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { VoiceAssist } from "./VoiceAssist";

export function ClauseGuardUI() {
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);
  const [clauseExplanation, setClauseExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState<string | null>(null);
  const [llmService, setLlmService] = useState<LLMService | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const voiceInterfaceRef = useRef<VoiceInterface | null>(null);

  useEffect(() => {
    const init = async () => {
      const keys = await getApiKeys();
      setLlmService(new LLMService(keys.groqApiKey, keys.geminiApiKey));
      voiceInterfaceRef.current = new VoiceInterface();
    };
    init();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const pageText = scanPage();
    const result = analyzeDocument(pageText);
    
    setAnalysis(result);
    setQuestions(result.questions);
    setIsScanning(false);
  };

  const handleExplainClause = async (clause: LegalClause) => {
    if (!llmService) return;

    if (expandedClauseId === clause.id) {
      setExpandedClauseId(null);
      setClauseExplanation(null);
      return;
    }

    setExpandedClauseId(clause.id);
    setIsExplaining(true);
    setClauseExplanation(null);

    try {
      const result = await llmService.explainClause(clause.text);
      setClauseExplanation(result.explanation);
    } catch (error) {
      setClauseExplanation("Unable to load explanation. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAskQuestion = async (question: SuggestedQuestion) => {
    if (!llmService || !analysis) return;

    const relevantClause = analysis.clauses.find(
      (c) => c.category === question.category
    );

    if (!relevantClause) return;

    setIsLoadingAnswer(true);

    try {
      const result = await llmService.explainClause(
        `${question.question}\n\nContext: ${relevantClause.text}`
      );
      
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, answer: result.explanation } : q
        )
      );
    } catch (error) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, answer: "Unable to load answer. Please try again." }
            : q
        )
      );
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!voiceInterfaceRef.current) return;

    if (isListening) {
      voiceInterfaceRef.current.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceInterfaceRef.current.startListening(
        (transcript) => {
          setVoiceText(transcript);
          setIsListening(false);
          handleVoiceCommand(transcript);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const handleVoiceCommand = (text: string) => {
    const lower = text.toLowerCase();
    
    if (lower.includes("scan") || lower.includes("analyze")) {
      handleScan();
    } else if (lower.includes("read") && analysis) {
      const summary = analysis.takeaways.map((t) => t.text).join(". ");
      voiceInterfaceRef.current?.speak(summary);
    }
  };

  const handleSpeak = (text: string) => {
    voiceInterfaceRef.current?.speak(text);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          backgroundColor: "#171717",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          zIndex: 999999,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "380px",
        maxHeight: "calc(100vh - 40px)",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "24px",
          height: "24px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#737373",
          zIndex: 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <Header
        documentType={analysis?.documentType || DocumentType.UNKNOWN}
        overallRisk={analysis?.overallRisk || RiskLevel.LOW}
        isScanning={isScanning}
        onScan={handleScan}
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
              padding: "32px 16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#737373",
                lineHeight: "1.5",
              }}
            >
              Click "Analyze This Page" to scan for risky clauses in the legal document on this page.
            </p>
          </div>
        )}

        {analysis && (
          <>
            <KeyTakeaways takeaways={analysis.takeaways} />

            <ClauseList
              clauses={analysis.clauses}
              onExplain={handleExplainClause}
              expandedClauseId={expandedClauseId}
              explanation={clauseExplanation}
              isExplaining={isExplaining}
            />

            <SuggestedQuestions
              questions={questions}
              onAsk={handleAskQuestion}
              isLoading={isLoadingAnswer}
            />
          </>
        )}
      </div>

      <VoiceAssist
        isListening={isListening}
        onToggle={handleVoiceToggle}
        onSpeak={handleSpeak}
        lastText={voiceText}
      />
    </div>
  );
}
