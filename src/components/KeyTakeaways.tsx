import { KeyTakeaway, RiskLevel } from "../types";

interface KeyTakeawaysProps {
  takeaways: KeyTakeaway[];
}

const riskDot: Record<RiskLevel, string> = {
  [RiskLevel.HIGH]: "#dc2626",
  [RiskLevel.MEDIUM]: "#ea580c",
  [RiskLevel.LOW]: "#65a30d",
};

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  if (takeaways.length === 0) return null;

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
        Key Takeaways
      </h4>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {takeaways.map((takeaway) => (
          <li
            key={takeaway.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginBottom: "8px",
              fontSize: "13px",
              color: "#404040",
              lineHeight: "1.5",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: riskDot[takeaway.risk],
                marginTop: "6px",
                flexShrink: 0,
              }}
            />
            {takeaway.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
