import { useState, useEffect, useRef } from "react";
import { Shield, X, FileText, MessageSquare } from "lucide-react";
import { 
  LegalClause, 
  DocumentAnalysis,
  SuggestedQuestion,
} from "../types";
import { VoiceInterface } from "../services/voiceInterface";
import { LLMService } from "../services/llmService";
import { analyzeDocument, scanPage } from "../utils/clauseDetector";
import { getApiKeys } from "../utils/storage";
import { Analysis } from "./Analysis";
import { Chat } from "./Chat";

type Tab = "analysis" | "chat";

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
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("analysis");
  
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
        onClick={() => {
          setIsVisible(true);
          setIsOpen(true);
        }}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#171717",
          border: "2px solid #262626",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.1)",
          zIndex: 2147483647,
          animation: "fadeIn 0.3s ease-out",
          padding: 0,
          margin: 0,
          lineHeight: 1,
        }}
      >
        <Shield size={24} color="#ffffff" style={{ display: "block", flexShrink: 0 }} />
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#171717",
          border: "2px solid #262626",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.1)",
          zIndex: 2147483647,
          animation: "fadeIn 0.3s ease-out",
          padding: 0,
          margin: 0,
          lineHeight: 1,
        }}
      >
        <Shield size={24} color="#ffffff" style={{ display: "block", flexShrink: 0 }} />
      </button>
    );
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.15)",
          zIndex: 2147483646,
          animation: "fadeIn 0.2s ease-out",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "420px",
          height: "calc(100vh - 48px)",
          maxHeight: "720px",
          backgroundColor: "#ffffff",
          border: "2px solid #262626",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          zIndex: 2147483647,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideInFromRight 0.3s ease-out",
          margin: 0,
          padding: 0,
          fontSize: "14px",
          lineHeight: 1.5,
          color: "#171717",
          textAlign: "left",
        }}
      >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          minHeight: "56px",
          flexShrink: 0,
        }}
      >
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Shield 
            size={20} 
            color="#171717" 
            style={{
              display: "block",
              flexShrink: 0,
            }}
          />
          <h2
            style={{
              margin: 0,
              padding: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#171717",
              lineHeight: "24px",
              whiteSpace: "nowrap",
            }}
          >
            ClauseGuard
          </h2>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
          }}
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#737373",
            borderRadius: "6px",
            padding: 0,
            margin: 0,
            lineHeight: 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X size={18} style={{ display: "block", flexShrink: 0 }} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#fafafa",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setActiveTab("analysis")}
          style={{
            flex: 1,
            padding: "12px 16px",
            backgroundColor: activeTab === "analysis" ? "#ffffff" : "transparent",
            border: "none",
            borderBottom:
              activeTab === "analysis" ? "2px solid #171717" : "2px solid transparent",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: activeTab === "analysis" ? 600 : 400,
            color: activeTab === "analysis" ? "#171717" : "#737373",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            margin: 0,
            lineHeight: "20px",
            height: "44px",
          }}
        >
          <FileText size={16} style={{ display: "block", flexShrink: 0 }} />
          <span>Analysis</span>
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            flex: 1,
            padding: "12px 16px",
            backgroundColor: activeTab === "chat" ? "#ffffff" : "transparent",
            border: "none",
            borderBottom:
              activeTab === "chat" ? "2px solid #171717" : "2px solid transparent",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: activeTab === "chat" ? 600 : 400,
            color: activeTab === "chat" ? "#171717" : "#737373",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            margin: 0,
            lineHeight: "20px",
            height: "44px",
          }}
        >
          <MessageSquare size={16} style={{ display: "block", flexShrink: 0 }} />
          <span>Chat</span>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "analysis" ? (
          <Analysis
            analysis={analysis}
            isScanning={isScanning}
            onScan={handleScan}
            expandedClauseId={expandedClauseId}
            clauseExplanation={clauseExplanation}
            isExplaining={isExplaining}
            onExplainClause={handleExplainClause}
            questions={questions}
            onAskQuestion={handleAskQuestion}
            isLoadingAnswer={isLoadingAnswer}
            isListening={isListening}
            onVoiceToggle={handleVoiceToggle}
            onSpeak={handleSpeak}
            voiceText={voiceText}
          />
        ) : (
          <Chat llmService={llmService} clauses={analysis?.clauses || []} />
        )}
      </div>
    </div>
    </>
  );
}
