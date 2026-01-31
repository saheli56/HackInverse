import { useState, useEffect } from "react";
import { LegalClause, RiskLevel, VoiceIntent, ScanResult } from "../types";
import { VoiceInterface } from "../services/voiceInterface";
import { LLMService } from "../services/llmService";
import { detectClauses, scanPage } from "../utils/clauseDetector";
import { parseVoiceCommand } from "../utils/voiceParser";
import { getApiKeys } from "../utils/storage";

export function ClauseGuardUI() {
  const [isListening, setIsListening] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedClause, setSelectedClause] = useState<LegalClause | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [status, setStatus] = useState<string>("Ready");
  const [llmService, setLlmService] = useState<LLMService | null>(null);

  const voiceInterface = new VoiceInterface();

  useEffect(() => {
    const initLLM = async () => {
      const keys = await getApiKeys();
      setLlmService(new LLMService(keys.groqApiKey, keys.geminiApiKey));
    };
    initLLM();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === " ") {
        toggleListening();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      voiceInterface.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      setStatus("Listening...");

      voiceInterface.startListening(
        async (transcript) => {
          setIsListening(false);
          setStatus(`Heard: "${transcript}"`);
          await handleVoiceCommand(transcript);
        },
        (error) => {
          setIsListening(false);
          setStatus(`Error: ${error}`);
        }
      );
    }
  };

  const handleVoiceCommand = async (transcript: string) => {
    const command = parseVoiceCommand(transcript);

    switch (command.intent) {
      case VoiceIntent.SCAN_PAGE:
        await performScan();
        break;
      case VoiceIntent.LIST_RISKS:
        listRisks();
        break;
      case VoiceIntent.EXPLAIN_CLAUSE:
        if (selectedClause) {
          await explainClause(selectedClause);
        } else {
          speak("Please select a clause first");
        }
        break;
      case VoiceIntent.HELP:
        showHelp();
        break;
      default:
        speak("I didn't understand that. Try saying 'scan page' or 'help'");
    }
  };

  const performScan = async () => {
    setStatus("Scanning page...");
    const pageText = scanPage();
    const clauses = detectClauses(pageText);

    const result: ScanResult = {
      clauses,
      summary: {
        totalClauses: clauses.length,
        highRisk: clauses.filter((c) => c.risk === RiskLevel.HIGH).length,
        mediumRisk: clauses.filter((c) => c.risk === RiskLevel.MEDIUM).length,
        lowRisk: clauses.filter((c) => c.risk === RiskLevel.LOW).length,
      },
    };

    setScanResult(result);
    setStatus("Scan complete");

    const message = `Found ${result.summary.totalClauses} clauses. ${result.summary.highRisk} high risk, ${result.summary.mediumRisk} medium risk, ${result.summary.lowRisk} low risk.`;
    speak(message);
  };

  const listRisks = () => {
    if (!scanResult || scanResult.clauses.length === 0) {
      speak("No scan results. Please scan the page first.");
      return;
    }

    const highRisk = scanResult.clauses.filter((c) => c.risk === RiskLevel.HIGH);
    if (highRisk.length === 0) {
      speak("No high-risk clauses found.");
    } else {
      speak(`Found ${highRisk.length} high-risk clauses. Showing details.`);
    }
  };

  const explainClause = async (clause: LegalClause) => {
    if (!llmService) {
      speak("LLM service not initialized");
      return;
    }

    setStatus("Explaining clause...");

    try {
      const result = await llmService.explainClause(clause.text);
      setExplanation(result.explanation);
      speak(result.explanation);
      setStatus("Ready");
    } catch (error) {
      setStatus("Failed to explain clause");
      speak("Sorry, I couldn't explain that clause");
    }
  };

  const showHelp = () => {
    const helpText = "Say: scan page to analyze, list risks to see dangerous clauses, or explain clause to understand selected text.";
    speak(helpText);
  };

  const speak = (text: string) => {
    voiceInterface.speak(text);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "360px",
        backgroundColor: "#fafafa",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        zIndex: 999999,
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            fontWeight: 600,
            color: "#171717",
          }}
        >
          ClauseGuard
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#737373",
          }}
        >
          {status}
        </p>
      </div>

      <div style={{ padding: "16px" }}>
        <button
          onClick={toggleListening}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: isListening ? "#171717" : "#f5f5f5",
            color: isListening ? "#fafafa" : "#171717",
            border: "1px solid #e5e5e5",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {isListening ? "Listening..." : "Press to speak (Ctrl+Space)"}
        </button>

        {scanResult && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#525252",
                marginBottom: "8px",
              }}
            >
              Found {scanResult.summary.totalClauses} clauses
            </div>
            <div style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
              <span style={{ color: "#dc2626" }}>
                High: {scanResult.summary.highRisk}
              </span>
              <span style={{ color: "#ea580c" }}>
                Med: {scanResult.summary.mediumRisk}
              </span>
              <span style={{ color: "#65a30d" }}>
                Low: {scanResult.summary.lowRisk}
              </span>
            </div>
          </div>
        )}

        {scanResult && scanResult.clauses.length > 0 && (
          <div style={{ marginTop: "12px", maxHeight: "240px", overflowY: "auto" }}>
            {scanResult.clauses.slice(0, 5).map((clause) => (
              <div
                key={clause.id}
                onClick={() => setSelectedClause(clause)}
                style={{
                  padding: "10px",
                  marginBottom: "8px",
                  backgroundColor: selectedClause?.id === clause.id ? "#f5f5f5" : "#ffffff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                  color: "#525252",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: clause.risk === RiskLevel.HIGH ? "#dc2626" : clause.risk === RiskLevel.MEDIUM ? "#ea580c" : "#65a30d",
                    marginBottom: "4px",
                  }}
                >
                  {clause.risk} RISK · {clause.category.replace(/_/g, " ")}
                </div>
                <div style={{ lineHeight: "1.4" }}>
                  {clause.text.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        )}

        {explanation && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#525252",
              lineHeight: "1.6",
            }}
          >
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
}
