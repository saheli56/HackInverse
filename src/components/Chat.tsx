import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, PresetPrompt, LegalClause } from "../types";
import { LLMService } from "../services/llmService";

interface ChatProps {
  llmService: LLMService | null;
  clauses: LegalClause[];
}

const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: "1",
    label: "Summarize all major risks",
    prompt: "Summarize all the major risks in this document in simple bullet points.",
  },
  {
    id: "2",
    label: "Any hidden fees or automatic charges?",
    prompt: "Are there any hidden fees or automatic charges I should be aware of?",
  },
  {
    id: "3",
    label: "What are the cancellation terms?",
    prompt: "What are the cancellation terms? Will I be charged any penalties for canceling?",
  },
  {
    id: "4",
    label: "How will my data be used?",
    prompt: "How will my personal data be used and shared? Is there anything concerning?",
  },
  {
    id: "5",
    label: "What rights am I giving up?",
    prompt: "What legal rights am I giving up by agreeing to this document?",
  },
  {
    id: "6",
    label: "Can this agreement be changed?",
    prompt: "Can the company change these terms without my consent? What happens if they do?",
  },
];

export function Chat({ llmService, clauses }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          backgroundColor: "#fafafa",
        }}
      >
        {messages.length === 0 && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                color: "#171717",
              }}
            >
              <Sparkles size={16} />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>
                Ask me anything about this document
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {PRESET_PROMPTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#404040",
                    cursor: "pointer",
                    textAlign: "left",
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
              marginBottom: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius:
                  message.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                backgroundColor: message.role === "user" ? "#171717" : "#ffffff",
                color: message.role === "user" ? "#ffffff" : "#171717",
                fontSize: "13px",
                lineHeight: "1.6",
                border: message.role === "assistant" ? "1px solid #e5e5e5" : "none",
              }}
            >
              {message.role === "assistant" ? (
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p style={{ margin: "0 0 10px 0" }}>
                          {children}
                        </p>
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
                        <li style={{ marginBottom: "6px" }}>{children}</li>
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
              gap: "10px",
              padding: "12px 16px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "16px 16px 16px 4px",
              maxWidth: "85%",
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
            <span style={{ fontSize: "13px", color: "#737373" }}>
              Thinking...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "8px",
          padding: "16px",
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
            padding: "12px 16px",
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
            padding: "12px 16px",
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
          {isLoading ? (
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
}


