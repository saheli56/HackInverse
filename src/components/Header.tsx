import { DocumentType, RiskLevel } from "../types";

interface HeaderProps {
  documentType: DocumentType;
  overallRisk: RiskLevel;
  isScanning: boolean;
  onScan: () => void;
}

const riskStyles: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  [RiskLevel.HIGH]: { bg: "#fef2f2", text: "#991b1b", label: "High Risk" },
  [RiskLevel.MEDIUM]: { bg: "#fffbeb", text: "#92400e", label: "Medium Risk" },
  [RiskLevel.LOW]: { bg: "#f0fdf4", text: "#166534", label: "Low Risk" },
};

export function Header({ documentType, overallRisk, isScanning, onScan }: HeaderProps) {
  const risk = riskStyles[overallRisk];

  return (
    <div
      style={{
        padding: "16px",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 4px 0",
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
            {documentType}
          </p>
        </div>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            backgroundColor: risk.bg,
            color: risk.text,
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {risk.label}
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
        }}
      >
        {isScanning ? "Analyzing..." : "Analyze This Page"}
      </button>
    </div>
  );
}
