import { Mic, MicOff } from "lucide-react";

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
            {isListening ? (
              <Mic size={14} color="#ffffff" />
            ) : (
              <MicOff size={14} color="#737373" />
            )}
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
