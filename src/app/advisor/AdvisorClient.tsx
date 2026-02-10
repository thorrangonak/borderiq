"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, AlertTriangle } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const COUNTRY_NAMES = Object.keys(COUNTRIES).map((n) => n.toLowerCase());

function findMentionedCountry(text: string): string | null {
  const lower = text.toLowerCase();
  // Check for exact country name matches (longest first to avoid partial matches)
  const sorted = [...Object.keys(COUNTRIES)].sort(
    (a, b) => b.length - a.length
  );
  for (const name of sorted) {
    if (lower.includes(name.toLowerCase())) {
      return name;
    }
  }
  return null;
}

function generateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Check for visa free keywords
  if (
    lower.includes("visa free") ||
    lower.includes("visa-free") ||
    lower.includes("without visa")
  ) {
    return "Great question! For detailed visa-free destination data, I recommend checking out our **Rankings page** where you can see exactly how many destinations each passport can access visa-free. You can also use the **Compare tool** to see overlapping visa-free access between multiple passports.";
  }

  // Check for comparison keywords
  if (
    lower.includes("compare") ||
    lower.includes("difference between") ||
    lower.includes("vs") ||
    lower.includes("versus")
  ) {
    return "Comparing passports is a great way to understand your travel options! Head over to our **Compare page** where you can select up to 4 passports side-by-side. You'll see common destinations, unique access, and combined mobility scores.";
  }

  // Check for ranking keywords
  if (
    lower.includes("ranking") ||
    lower.includes("strongest") ||
    lower.includes("most powerful") ||
    lower.includes("best passport") ||
    lower.includes("top passport")
  ) {
    return "As of 2026, the most powerful passports are typically from countries like **Japan**, **Singapore**, **Germany**, **France**, and **South Korea**, with mobility scores above 190. Visit our **Rankings page** for the complete list of all 199 passports ranked by travel freedom.";
  }

  // Check for country mentions
  const country = findMentionedCountry(userMessage);
  if (country) {
    const meta = COUNTRIES[country];
    return `Here are some quick insights about **${country}** (${meta.region}):\n\n- Passport color: **${meta.passportColor}** cover\n- Region: **${meta.subregion}**\n\nFor detailed visa-free access data, mobility score, and destination breakdowns, visit the **${country} country page** in our database. You can also compare it with other passports using our Compare tool!\n\nTip: If you're planning to travel with a ${country} passport, always check the latest entry requirements with official embassy sources before your trip.`;
  }

  // Check for greetings
  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("hey") ||
    lower.includes("good morning") ||
    lower.includes("good evening")
  ) {
    return "Hello! Welcome to BorderIQ. I can help you explore passport rankings, discover visa-free destinations, and understand your travel options. Just tell me which passport you hold, or ask me about any country!";
  }

  // Check for thanks
  if (
    lower.includes("thank") ||
    lower.includes("thanks") ||
    lower.includes("appreciate")
  ) {
    return "You're welcome! Feel free to ask me anything about passport rankings, visa requirements, or travel freedom. I'm here to help you navigate the world of global mobility.";
  }

  // Check for help
  if (
    lower.includes("help") ||
    lower.includes("what can you do") ||
    lower.includes("how does this work")
  ) {
    return "Here's what I can help you with:\n\n- **Passport info**: Tell me a country name and I'll share quick insights\n- **Rankings**: Ask about the strongest or weakest passports\n- **Visa-free travel**: I can point you to the right tools\n- **Comparisons**: Ask about comparing passports\n\nFor detailed data, also check out our **Rankings**, **Explore**, and **Compare** pages!";
  }

  // Default response
  return "I'm still learning! For now, I can help with basic passport and travel questions. Try asking me about a specific country, visa-free travel, or passport rankings.\n\nFor comprehensive data, check out our **Rankings** and **Compare** tools in the navigation above.";
}

export default function AdvisorClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "bot",
      content:
        "Hello! I'm your BorderIQ Travel Advisor. Tell me which passport(s) you hold, and I'll help you discover your travel options.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateResponse(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "bot",
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function renderMarkdown(text: string) {
    // Simple markdown: bold (**text**) and newlines
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-teal-300 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle newlines
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 gradient-radial-teal" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-6 sm:pb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-teal-400 font-medium tracking-wide uppercase text-sm">
              AI Advisor
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-white via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Travel Advisor
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-foreground-muted max-w-2xl leading-relaxed">
            Ask questions about passport power, visa-free destinations, and
            travel options. Your AI-powered travel intelligence assistant.
          </p>
        </div>
      </section>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="rounded-xl sm:rounded-2xl bg-card border border-border overflow-hidden flex flex-col" style={{ minHeight: "min(500px, 60vh)" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "bot"
                      ? "bg-teal-500/15 border border-teal-500/25"
                      : "bg-navy-600 border border-border"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <Bot className="w-4 h-4 text-teal-400" />
                  ) : (
                    <User className="w-4 h-4 text-foreground-muted" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-500/15 border border-teal-500/25 text-foreground"
                      : "bg-navy-700/60 border border-border text-foreground-muted"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <div className="text-foreground/90">
                      {renderMarkdown(msg.content)}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-teal-500/15 border border-teal-500/25">
                  <Bot className="w-4 h-4 text-teal-400" />
                </div>
                <div className="bg-navy-700/60 border border-border rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-teal-400/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-teal-400/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-teal-400/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-3 sm:px-6 py-2">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-foreground-subtle">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                AI Advisor is in beta. Always verify visa requirements with
                official sources.
              </span>
            </div>
          </div>

          {/* Input Bar */}
          <div className="border-t border-border p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about passports, visas..."
                className="flex-1 px-3 sm:px-4 py-3 rounded-xl bg-navy-800 border border-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/25 transition-colors"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex-shrink-0 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-500/15 border border-teal-500/25 text-teal-400 hover:bg-teal-500/25 hover:border-teal-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              {[
                "Strongest passport?",
                "Tell me about Japan",
                "Compare passports",
                "Visa-free travel?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-navy-700/50 border border-border text-[11px] sm:text-xs text-foreground-muted hover:text-foreground hover:bg-navy-700 transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
