import { Shield, AlertTriangle, AlertCircle, CheckCircle, Loader2, Search } from "lucide-react";
import { DocumentType, RiskLevel } from "../types";

interface HeaderProps {
  documentType: DocumentType;
  overallRisk: RiskLevel;
  isScanning: boolean;
  onScan: () => void;
}

const riskStyles: Record<RiskLevel, { bg: string; text: string; label: string; Icon: typeof AlertTriangle }> = {
  [RiskLevel.HIGH]: { bg: "#fef2f2", text: "#991b1b", label: "High Risk", Icon: AlertTriangle },
  [RiskLevel.MEDIUM]: { bg: "#fffbeb", text: "#92400e", label: "Medium Risk", Icon: AlertCircle },
  [RiskLevel.LOW]: { bg: "#f0fdf4", text: "#166534", label: "Low Risk", Icon: CheckCircle },
};

export function Header({ documentType, overallRisk, isScanning, onScan }: HeaderProps) {
  const risk = riskStyles[overallRisk];
  const RiskIcon = risk.Icon;

  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #e5e5e5",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          minHeight: "32px",
        }}
      >
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <Shield 
            size={20} 
            color="#171717" 
            style={{
              flexShrink: 0,
              display: "block",
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                margin: 0,
                padding: 0,
                fontSize: "14px",
                fontWeight: 600,
                color: "#171717",
                lineHeight: "20px",
                marginBottom: "2px",
              }}
            >
              PlainTerms
            </h3>
            <p
              style={{
                margin: 0,
                padding: 0,
                fontSize: "12px",
                color: "#737373",
                lineHeight: "16px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {documentType}
            </p>
          </div>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            backgroundColor: risk.bg,
            color: risk.text,
            fontSize: "11px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexShrink: 0,
            marginLeft: "8px",
            height: "24px",
            lineHeight: "16px",
          }}
        >
          <RiskIcon 
            size={12} 
            style={{
              flexShrink: 0,
              display: "block",
            }}
          />
          <span style={{ whiteSpace: "nowrap" }}>{risk.label}</span>
        </div>
      </div>
      <button
        onClick={onScan}
        disabled={isScanning}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: isScanning ? "#e5e5e5" : "#171717",
          color: isScanning ? "#737373" : "#fafafa",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 500,
          cursor: isScanning ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          lineHeight: "20px",
          height: "40px",
        }}
      >
        {isScanning ? (
          <>
            <Loader2 
              size={14} 
              style={{ 
                animation: "spin 1s linear infinite",
                flexShrink: 0,
                display: "block",
              }} 
            />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Search 
              size={14}
              style={{
                flexShrink: 0,
                display: "block",
              }}
            />
            <span>Analyze This Page</span>
          </>
        )}
      </button>
    </div>
  );
}
