import { useState } from "react";
import { HelpCircle, Loader2, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SuggestedQuestion } from "../types";

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onAsk: (question: SuggestedQuestion) => void;
  isLoading: boolean;
}

export function SuggestedQuestions({ questions, onAsk, isLoading }: SuggestedQuestionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (questions.length === 0) return null;

  const handleClick = (question: SuggestedQuestion) => {
    if (expandedId === question.id) {
      setExpandedId(null);
    } else {
      setExpandedId(question.id);
      if (!question.answer) {
        onAsk(question);
      }
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #e5e5e5",
        margin: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          margin: "0 0 12px 0",
          padding: 0,
        }}
      >
        <HelpCircle size={14} color="#171717" style={{ display: "block", flexShrink: 0 }} />
        <h4
          style={{
            margin: 0,
            padding: 0,
            fontSize: "12px",
            fontWeight: 600,
            color: "#171717",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            lineHeight: "16px",
            height: "auto",
          }}
        >
          Common Questions
        </h4>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: 0, padding: 0 }}>
        {questions.map((q) => (
          <div key={q.id} style={{ margin: 0, padding: 0 }}>
            <button
              onClick={() => handleClick(q)}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: expandedId === q.id ? "#f5f5f5" : "#ffffff",
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#404040",
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: 0,
                lineHeight: "18px",
                minHeight: "38px",
              }}
            >
              <ChevronRight 
                size={12} 
                color="#737373"
                style={{
                  transform: expandedId === q.id ? "rotate(90deg)" : "none",
                  transition: "transform 0.2s",
                  display: "block",
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{q.question}</span>
            </button>
            {expandedId === q.id && (
              <div
                style={{
                  marginTop: "6px",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#404040",
                  lineHeight: "1.6",
                }}
              >
                {isLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, padding: 0 }}>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite", display: "block", flexShrink: 0 }} />
                    <span>Loading answer...</span>
                  </div>
                ) : q.answer ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p style={{ margin: "0 0 8px 0" }}>{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul style={{ margin: "8px 0", paddingLeft: "16px" }}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol style={{ margin: "8px 0", paddingLeft: "16px" }}>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginBottom: "4px" }}>{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 600 }}>{children}</strong>
                      ),
                    }}
                  >
                    {q.answer}
                  </ReactMarkdown>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
