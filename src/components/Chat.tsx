import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, PresetPrompt, LegalClause } from "../types";
import { LLMService } from "../services/llmService";

interface ChatProps {
  llmService: LLMService | null;
  clauses: LegalClause[];
  isOpen: boolean;
  onToggle: () => void;
}

const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: "1",
    label: "Summarize risks",
    prompt: "Summarize all the major risks in this document in simple bullet points.",
  },
  {
    id: "2",
    label: "Hidden fees?",
    prompt: "Are there any hidden fees or automatic charges I should be aware of?",
  },
  {
    id: "3",
    label: "Can I cancel?",
    prompt: "What are the cancellation terms? Will I be charged any penalties for canceling?",
  },
  {
    id: "4",
    label: "Data usage",
    prompt: "How will my personal data be used and shared? Is there anything concerning?",
  },
  {
    id: "5",
    label: "My rights",
    prompt: "What legal rights am I giving up by agreeing to this document?",
  },
];

export function Chat({ llmService, clauses, isOpen, onToggle }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getDocumentContext = (): string => {
    if (clauses.length === 0) return "";
    return clauses.map((c) => `[${c.category}] ${c.text}`).join("\n\n");
  };

  const sendMessage = async (content: string) => {
    if (!llmService || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowPresets(false);

    try {
      const context = getDocumentContext();
      const response = await llmService.chat([...messages, userMessage], context);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please check that your API keys are configured correctly and try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePresetClick = (prompt: PresetPrompt) => {
    sendMessage(prompt.prompt);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          width: "100%",
          padding: "12px",
          backgroundColor: "#171717",
          color: "#ffffff",
          border: "none",
          borderRadius: "0 0 8px 8px",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <MessageSquare size={16} />
        Ask a Question
      </button>
    );
  }

  return (
    <div
      style={{
        borderTop: "1px solid #e5e5e5",
        display: "flex",
        flexDirection: "column",
        maxHeight: "400px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "#171717",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageSquare size={16} />
          <span style={{ fontSize: "13px", fontWeight: 500 }}>Chat</span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          backgroundColor: "#fafafa",
          minHeight: "200px",
          maxHeight: "280px",
        }}
      >
        {messages.length === 0 && showPresets && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "12px",
                color: "#737373",
                fontSize: "11px",
              }}
            >
              <Sparkles size={12} />
              <span>Quick questions</span>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {PRESET_PROMPTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "16px",
                    fontSize: "12px",
                    color: "#404040",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                    e.currentTarget.style.borderColor = "#d4d4d4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#e5e5e5";
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "90%",
                padding: "10px 14px",
                borderRadius:
                  message.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                backgroundColor: message.role === "user" ? "#171717" : "#ffffff",
                color: message.role === "user" ? "#ffffff" : "#171717",
                fontSize: "13px",
                lineHeight: "1.5",
                border: message.role === "assistant" ? "1px solid #e5e5e5" : "none",
              }}
            >
              {message.role === "assistant" ? (
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                  className="markdown-content"
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p style={{ margin: "0 0 8px 0" }}>{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul
                          style={{
                            margin: "8px 0",
                            paddingLeft: "20px",
                          }}
                        >
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol
                          style={{
                            margin: "8px 0",
                            paddingLeft: "20px",
                          }}
                        >
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li style={{ marginBottom: "4px" }}>{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong style={{ fontWeight: 600 }}>{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code
                          style={{
                            backgroundColor: "#f5f5f5",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          {children}
                        </code>
                      ),
                      h1: ({ children }) => (
                        <h1
                          style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            margin: "12px 0 8px 0",
                          }}
                        >
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            margin: "10px 0 6px 0",
                          }}
                        >
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            margin: "8px 0 4px 0",
                          }}
                        >
                          {children}
                        </h3>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "16px 16px 16px 4px",
              maxWidth: "90%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "4px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#a3a3a3",
                    animation: "pulse 1s infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: "12px", color: "#737373" }}>
              Thinking...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
        <button
          onClick={() => setShowPresets(!showPresets)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            padding: "6px",
            backgroundColor: "#f5f5f5",
            border: "none",
            borderTop: "1px solid #e5e5e5",
            fontSize: "11px",
            color: "#737373",
            cursor: "pointer",
          }}
        >
          {showPresets ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showPresets ? "Hide suggestions" : "Show suggestions"}
        </button>
      )}

      {messages.length > 0 && showPresets && (
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            {PRESET_PROMPTS.slice(0, 3).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                disabled={isLoading}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#525252",
                  cursor: isLoading ? "default" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px",
          borderTop: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this document..."
          disabled={isLoading || !llmService}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: "13px",
            outline: "none",
            backgroundColor: isLoading ? "#f5f5f5" : "#ffffff",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim() || !llmService}
          style={{
            padding: "10px 14px",
            backgroundColor:
              isLoading || !input.trim() ? "#e5e5e5" : "#171717",
            color: isLoading || !input.trim() ? "#a3a3a3" : "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: isLoading || !input.trim() ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
