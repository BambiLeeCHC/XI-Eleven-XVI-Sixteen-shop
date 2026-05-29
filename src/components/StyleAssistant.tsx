import { useAction } from "convex/react";
import { useState, useRef, useEffect } from "react";
import { api } from "../../convex/_generated/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { label: "📐 Find My Size", prompt: "I need help finding my size" },
  { label: "👗 Style Me", prompt: "Can you suggest an outfit for me?" },
  { label: "🧵 About Fabrics", prompt: "Tell me about the fabrics you use" },
  { label: "📦 Shipping Info", prompt: "How does shipping work?" },
];

export function StyleAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to XI · XVI ✦ I'm your personal style concierge. I can help you find your perfect size, suggest outfit pairings, walk you through fabrics and fits, or answer anything about the collection. What can I help you with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const brandChat = useAction(api.viktorTools.brandChat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage || isLoading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send conversation history (skip the initial greeting)
      const history = newMessages.slice(1).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await brandChat({
        message: userMessage,
        history: history.slice(0, -1), // exclude current message since it's in `message`
      });
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having a brief moment — please try again shortly. In the meantime, feel free to reach out to us at xixvi1116@icloud.com ✦",
        },
      ]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-[9998] w-[calc(100vw-32px)] sm:w-[380px] max-h-[520px] flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(180deg, #0e0820 0%, #0a0a0f 100%)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.6), 0 0 50px rgba(168, 85, 247, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
            animation: "fade-in-up 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              borderBottom: "1px solid rgba(168, 85, 247, 0.15)",
              background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(200,140,255,0.04) 100%)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)" }}>
                <span className="text-white text-xs">✦</span>
              </div>
              <div>
                <span className="text-[11px] tracking-[0.15em] uppercase text-white/80 font-semibold block leading-tight">
                  Style Concierge
                </span>
                <span className="text-[9px] text-purple-400/60 tracking-wider uppercase">XI · XVI</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white/70 transition-colors p-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-1" style={{ background: "rgba(168,85,247,0.2)" }}>
                    <span className="text-[8px] text-purple-400">✦</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                    msg.role === "user"
                      ? "rounded-br-sm"
                      : "rounded-bl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background: "linear-gradient(135deg, rgba(168,85,247,0.25) 0%, rgba(139,92,246,0.2) 100%)",
                          color: "rgba(255,255,255,0.9)",
                          border: "1px solid rgba(168,85,247,0.2)",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(255,255,255,0.78)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-1" style={{ background: "rgba(168,85,247,0.2)" }}>
                  <span className="text-[8px] text-purple-400">✦</span>
                </div>
                <div
                  className="px-3.5 py-2.5 text-[13px] rounded-2xl rounded-bl-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="inline-flex gap-1 text-purple-400">
                    <span className="animate-pulse">✦</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>✦</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>✦</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts — show only at start */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => handleSend(qp.prompt)}
                  className="px-3 py-1.5 text-[10px] tracking-wide uppercase font-medium transition-all hover:scale-[1.02] rounded-full cursor-pointer"
                  style={{
                    background: "rgba(168,85,247,0.08)",
                    border: "1px solid rgba(168,85,247,0.18)",
                    color: "rgba(200,170,255,0.7)",
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3" style={{ borderTop: "1px solid rgba(168, 85, 247, 0.1)" }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sizing, fabrics, styling..."
                className="flex-1 bg-white/5 border border-white/10 text-white/85 placeholder-white/25 px-3.5 py-2.5 text-sm outline-none focus:border-purple-400/40 transition-colors rounded-xl"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3.5 py-2.5 text-sm font-bold text-white disabled:opacity-25 transition-all rounded-xl cursor-pointer"
                style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
              >
                →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] group cursor-pointer"
        aria-label="Open Style Concierge"
      >
        <div
          className="absolute inset-[-6px] rounded-full holo-ring transition-opacity duration-500 opacity-60"
          style={{ padding: "2px" }}
        >
          <div className="w-full h-full rounded-full bg-[#0c0c0f]" />
        </div>
        <div
          className="absolute inset-[-12px] rounded-full transition-opacity duration-500 opacity-40"
          style={{
            background:
              "conic-gradient(from 90deg, rgba(255,0,0,0.15), rgba(255,255,0,0.15), rgba(0,255,255,0.15), rgba(255,0,255,0.15), rgba(255,0,0,0.15))",
            filter: "blur(8px)",
            animation: "holo-spin 4s linear infinite reverse",
          }}
        />
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 bg-[#0c0c0f] border-2 border-white/8 ghost-icon">
          <span className="text-xl">{isOpen ? "×" : "✦"}</span>
        </div>
      </button>
    </>
  );
}
