import { useState, useEffect } from "react";
import { LegalClause, RiskLevel, RiskCategory } from "../types";
import { VoiceInterface } from "../services/voiceInterface";
import { LLMService } from "../services/llmService";
import { detectClauses, scanPage } from "../utils/clauseDetector";
import { getApiKeys } from "../utils/storage";
import { detectDocumentType, calculateOverallRisk, DocumentType } from "../utils/documentAnalyzer";
import { extractKeyTakeaways, generateSuggestedQuestions, KeyTakeaway, SuggestedQuestion } from "../utils/keyTakeaways";

export function ClauseGuardUI() {
  const [isScanning, setIsScanning] = useState(false);
  const [clauses, setClauses] = useState<LegalClause[]>([]);
  const [documentType, setDocumentType] = useState<DocumentType>("Legal Document");
  const [overallRisk, setOverallRisk] = useState<RiskLevel>(RiskLevel.LOW);
  const [keyTakeaways, setKeyTakeaways] = useState<KeyTakeaway[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [expandedClause, setExpandedClause] = useState<string | null>(null);
  const [clauseExplanations, setClauseExplanations] = useState<Record<string, string>>({});
  const [llmService, setLlmService] = useState<LLMService | null>(null);
  const [isListening, setIsListening] = useState(false);

  const voiceInterface = new VoiceInterface();

  useEffect(() => {
    const initLLM = async () => {
      const keys = await getApiKeys();
      setLlmService(new LLMService(keys.groqApiKey, keys.geminiApiKey));
    };
    initLLM();
    performInitialScan();
  }, []);

  const performInitialScan = () => {
    setIsScanning(true);
    const pageText = scanPage();
    const detectedClauses = detectClauses(pageText);
    const docType = detectDocumentType();
    const risk = calculateOverallRisk(detectedClauses);
    const takeaways = extractKeyTakeaways(detectedClauses);
    const questions = generateSuggestedQuestions(detectedClauses);

    setClauses(detectedClauses);
    setDocumentType(docType);
    setOverallRisk(risk);
    setKeyTakeaways(takeaways);
    setSuggestedQuestions(questions);
    setIsScanning(false);
  };

  const handleQuestionClick = async (question: SuggestedQuestion) => {
    const relevantClauses = clauses.filter((c) => c.category === question.category);
    if (relevantClauses.length > 0 && llmService) {
      const explanation = await getOrFetchExplanation(relevantClauses[0]);
      if (explanation) {
        voiceInterface.speak(explanation);
      }
    }
  };

  const handleClauseClick = (clauseId: string) => {
    setExpandedClause(expandedClause === clauseId ? null : clauseId);
  };

  const getOrFetchExplanation = async (clause: LegalClause): Promise<string | null> => {
    if (clauseExplanations[clause.id]) {
      return clauseExplanations[clause.id];
    }

    if (!llmService) return null;

    try {
      const result = await llmService.explainClause(clause.text);
      setClauseExplanations((prev) => ({
        ...prev,
        [clause.id]: result.explanation,
      }));
      return result.explanation;
    } catch (error) {
      return null;
    }
  };

  const toggleVoiceAssistance = () => {
    if (isListening) {
      voiceInterface.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceInterface.startListening(
        (transcript) => {
          setIsListening(false);
          handleVoiceInput(transcript);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const handleVoiceInput = (transcript: string) => {
    const text = transcript.toLowerCase();
    
    if (text.includes("scan") || text.includes("analyze")) {
      performInitialScan();
      voiceInterface.speak("Scanning page");
    } else if (text.includes("takeaway") || text.includes("summary")) {
      const summary = keyTakeaways.map((t) => t.text).join(". ");
      voiceInterface.speak(summary || "No key takeaways found");
    } else {
      voiceInterface.speak("Try asking about the page summary or tell me to scan the page");
    }
  };

  const groupClausesByCategory = (): Record<string, LegalClause[]> => {
    const grouped: Record<string, LegalClause[]> = {};
    clauses.forEach((clause) => {
      const category = clause.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(clause);
    });
    return grouped;
  };

  const formatCategoryName = (category: RiskCategory): string => {
    return category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case RiskLevel.HIGH:
        return "#dc2626";
      case RiskLevel.MEDIUM:
        return "#ea580c";
      case RiskLevel.LOW:
        return "#65a30d";
    }
  };

  const groupedClauses = groupClausesByCategory();

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
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        zIndex: 999999,
        overflowY: "auto",
      }}
    >
      {isScanning ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#737373" }}>
          Analyzing document...
        </div>
      ) : (
        <>
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#737373",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {documentType}
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#171717",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Overall Risk:{" "}
              <span style={{ color: getRiskColor(overallRisk) }}>
                {overallRisk}
              </span>
            </div>
          </div>

          {keyTakeaways.length > 0 && (
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#171717",
                  marginBottom: "12px",
                }}
              >
                Key Takeaways
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "13px",
                  color: "#525252",
                  lineHeight: "1.6",
                }}
              >
                {keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    {takeaway.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(groupedClauses).length > 0 && (
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#171717",
                  marginBottom: "12px",
                }}
              >
                Important Clauses
              </div>
              {Object.entries(groupedClauses).map(([category, clausesInCategory]) => (
                <div key={category} style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#404040",
                      marginBottom: "8px",
                    }}
                  >
                    {formatCategoryName(category as RiskCategory)}
                  </div>
                  {clausesInCategory.map((clause) => (
                    <div
                      key={clause.id}
                      style={{
                        marginBottom: "8px",
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        onClick={() => handleClauseClick(clause.id)}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          backgroundColor: expandedClause === clause.id ? "#fafafa" : "#ffffff",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: getRiskColor(clause.risk),
                            fontWeight: 600,
                            marginBottom: "4px",
                          }}
                        >
                          {clause.risk} RISK
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#525252",
                            lineHeight: "1.5",
                          }}
                        >
                          {clause.text.substring(0, 80)}...
                        </div>
                      </div>
                      {expandedClause === clause.id && (
                        <div
                          style={{
                            padding: "12px",
                            backgroundColor: "#fafafa",
                            borderTop: "1px solid #e5e5e5",
                            fontSize: "12px",
                            color: "#525252",
                            lineHeight: "1.6",
                          }}
                        >
                          {clauseExplanations[clause.id] ? (
                            clauseExplanations[clause.id]
                          ) : (
                            <div
                              style={{
                                padding: "8px",
                                textAlign: "center",
                                color: "#737373",
                              }}
                            >
                              <button
                                onClick={async () => {
                                  await getOrFetchExplanation(clause);
                                }}
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#171717",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                }}
                              >
                                Get Explanation
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {suggestedQuestions.length > 0 && (
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#171717",
                  marginBottom: "12px",
                }}
              >
                Common Questions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionClick(question)}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #e5e5e5",
                      borderRadius: "4px",
                      fontSize: "12px",
                      color: "#171717",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#ececec";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                  >
                    {question.question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#fafafa",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#737373",
                marginBottom: "8px",
              }}
            >
              Voice Assistance (Optional)
            </div>
            <button
              onClick={toggleVoiceAssistance}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: isListening ? "#171717" : "#ffffff",
                color: isListening ? "#ffffff" : "#171717",
                border: "1px solid #e5e5e5",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>{isListening ? "🎤" : "🎙️"}</span>
              {isListening ? "Listening..." : "Ask by voice"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
