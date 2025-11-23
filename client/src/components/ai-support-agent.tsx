import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Lightbulb } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SuggestedPrompt {
  text: string;
}

export function AISupportAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Welcome to IntentX Support! I can help you with intent explanations, strategy optimization, risk analysis, FAQ answers, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load suggested prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const response = await fetch("/api/ai-support-prompts");
        if (response.ok) {
          const data = await response.json();
          setSuggestedPrompts(
            (data.prompts || []).map((text: string) => ({ text }))
          );
        }
      } catch (error) {
        console.log("Could not load suggested prompts");
      }
    };
    loadPrompts();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call backend API for AI response
      const response = await fetch("/api/ai-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback response
      const fallbackMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content:
          "I'm having trouble processing your question right now. Please try again or check our FAQ for common questions!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    // Auto-send after a short delay to show the input
    setTimeout(() => {
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: prompt,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      fetch("/api/ai-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const assistantMessage: Message = {
            id: `msg-${Date.now()}-ai`,
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        })
        .catch(() => {
          const errorMessage: Message = {
            id: `msg-${Date.now()}-error`,
            role: "assistant",
            content: "Sorry, I couldn't process that. Try again or check FAQ!",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        })
        .finally(() => setIsLoading(false));
    }, 100);
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        variant="default"
        data-testid="button-ai-support"
        className="relative"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6 w-96 max-w-[calc(100vw-2rem)]">
          <Card className="flex flex-col h-[600px] md:h-[550px] shadow-2xl border-2">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-purple-600/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">IntentX AI Support</h3>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                size="icon"
                variant="ghost"
                data-testid="button-close-support"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none"
                      }`}
                      data-testid={`message-${msg.role}-${msg.id}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground px-3 py-2 rounded-lg text-sm rounded-bl-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Suggested Prompts */}
            {suggestedPrompts.length > 0 && messages.length <= 1 && (
              <div className="px-4 py-2 border-t space-y-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Lightbulb className="w-3 h-3" />
                  <span>Try asking:</span>
                </div>
                <div className="space-y-1">
                  {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleSuggestedPrompt(prompt.text)}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-1 px-2 text-left"
                      data-testid={`button-suggested-prompt-${idx}`}
                    >
                      "{prompt.text}"
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  data-testid="input-support-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  data-testid="button-send-support"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                AI-Powered Support • Strategy & Risk Analysis
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
