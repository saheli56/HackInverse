import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LegalClause, RiskLevel, RiskCategory } from "../types";

interface ClauseListProps {
  clauses: LegalClause[];
  onExplain: (clause: LegalClause) => void;
  expandedClauseId: string | null;
  explanation: string | null;
  isExplaining: boolean;
}

const categoryLabels: Record<RiskCategory, string> = {
  [RiskCategory.CANCELLATION]: "Cancellation",
  [RiskCategory.BILLING]: "Billing & Auto-renewal",
  [RiskCategory.DATA_PRIVACY]: "Data Sharing",
  [RiskCategory.ARBITRATION]: "Legal Rights",
  [RiskCategory.LIABILITY]: "Liability",
  [RiskCategory.TERMINATION]: "Termination",
  [RiskCategory.MODIFICATION]: "Terms Changes",
  [RiskCategory.WARRANTY]: "Warranty",
  [RiskCategory.INDEMNIFICATION]: "Indemnification",
  [RiskCategory.JURISDICTION]: "Jurisdiction",
};

const riskColors: Record<RiskLevel, string> = {
  [RiskLevel.HIGH]: "#dc2626",
  [RiskLevel.MEDIUM]: "#ea580c",
  [RiskLevel.LOW]: "#65a30d",
};

const riskIcons: Record<RiskLevel, typeof AlertTriangle> = {
  [RiskLevel.HIGH]: AlertTriangle,
  [RiskLevel.MEDIUM]: AlertCircle,
  [RiskLevel.LOW]: CheckCircle,
};

function groupClausesByCategory(clauses: LegalClause[]): Record<RiskCategory, LegalClause[]> {
  const grouped = {} as Record<RiskCategory, LegalClause[]>;
  
  clauses.forEach((clause) => {
    if (!grouped[clause.category]) {
      grouped[clause.category] = [];
    }
    grouped[clause.category].push(clause);
  });

  return grouped;
}

export function ClauseList({ 
  clauses, 
  onExplain, 
  expandedClauseId, 
  explanation,
  isExplaining,
}: ClauseListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<RiskCategory>>(new Set());
  
  if (clauses.length === 0) return null;

  const grouped = groupClausesByCategory(clauses);

  const toggleCategory = (category: RiskCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #e5e5e5",
        margin: 0,
      }}
    >
      <h4
        style={{
          margin: "0 0 12px 0",
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
        Important Clauses
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: 0, padding: 0 }}>
        {Object.entries(grouped).map(([category, categoryClauses]) => (
          <div
            key={category}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => toggleCategory(category as RiskCategory)}
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#fafafa",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: 0,
                lineHeight: "20px",
                minHeight: "40px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {expandedCategories.has(category as RiskCategory) ? (
                  <ChevronDown size={14} color="#525252" style={{ display: "block", flexShrink: 0 }} />
                ) : (
                  <ChevronRight size={14} color="#525252" style={{ display: "block", flexShrink: 0 }} />
                )}
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#171717",
                    lineHeight: "20px",
                  }}
                >
                  {categoryLabels[category as RiskCategory]}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#737373",
                  lineHeight: "16px",
                }}
              >
                {categoryClauses.length} clause{categoryClauses.length > 1 ? "s" : ""}
              </span>
            </button>
            {expandedCategories.has(category as RiskCategory) && (
              <div style={{ padding: "8px" }}>
                {categoryClauses.map((clause) => {
                  const RiskIcon = riskIcons[clause.risk];
                  return (
                  <div
                    key={clause.id}
                    style={{
                      padding: "10px",
                      marginBottom: "6px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #f0f0f0",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: riskColors[clause.risk],
                          lineHeight: "16px",
                        }}
                      >
                        <RiskIcon size={12} style={{ display: "block", flexShrink: 0 }} />
                        <span>{clause.risk} RISK</span>
                      </div>
                    </div>
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        padding: 0,
                        fontSize: "12px",
                        color: "#404040",
                        lineHeight: "18px",
                      }}
                    >
                      {clause.summary}
                    </p>
                    <button
                      onClick={() => onExplain(clause)}
                      disabled={isExplaining && expandedClauseId === clause.id}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "transparent",
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: "#525252",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        margin: 0,
                        lineHeight: "16px",
                        height: "28px",
                      }}
                    >
                      {isExplaining && expandedClauseId === clause.id ? (
                        <>
                          <Loader2 size={12} style={{ animation: "spin 1s linear infinite", display: "block", flexShrink: 0 }} />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Info size={12} style={{ display: "block", flexShrink: 0 }} />
                          <span>Show Details</span>
                        </>
                      )}
                    </button>
                    {expandedClauseId === clause.id && explanation && (
                      <div
                        style={{
                          marginTop: "10px",
                          padding: "10px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "4px",
                          fontSize: "12px",
                          color: "#404040",
                          lineHeight: "1.6",
                        }}
                      >
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
                          {explanation}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
