interface VoiceAssistProps {
  isListening: boolean;
  onToggle: () => void;
  onSpeak: (text: string) => void;
  lastText: string | null;
}

export function VoiceAssist({ isListening, onToggle, lastText }: VoiceAssistProps) {
  return (
    <div
      style={{
        padding: "12px 16px",
        backgroundColor: "#fafafa",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            onClick={onToggle}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: isListening ? "#171717" : "#ffffff",
              border: "1px solid #e5e5e5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isListening ? "#ffffff" : "#737373"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <span
            style={{
              fontSize: "11px",
              color: "#737373",
            }}
          >
            {isListening ? "Listening..." : "Ask by voice (optional)"}
          </span>
        </div>
      </div>
      {lastText && (
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "11px",
            color: "#737373",
            fontStyle: "italic",
          }}
        >
          "{lastText}"
        </p>
      )}
    </div>
  );
}
