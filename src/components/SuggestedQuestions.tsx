import { useState } from "react";
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
      }}
    >
      <h4
        style={{
          margin: "0 0 12px 0",
          fontSize: "12px",
          fontWeight: 600,
          color: "#171717",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Common Questions
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {questions.map((q) => (
          <div key={q.id}>
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
              }}
            >
              {q.question}
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
                {isLoading ? "Loading answer..." : q.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
