import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  apiBaseUrl: string;
};

export function CopilotChat({ apiBaseUrl }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await axios.post(`${apiBaseUrl}/copilot-query`, { question });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I wasn't able to reach the GreenHealth AI backend. Please check the API service."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>healer</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex-1 space-y-2 overflow-y-auto rounded-md border border-border bg-secondary/40 p-2 text-sm">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Ask about live sustainability performance, policy compliance, or practical
              initiatives (for example, "How can ICU reduce medical waste without
              impacting care quality?").
            </p>
          )}
          {messages.map((message, idx) => (
            <div
              key={`${message.role}-${idx}`}
              className={`rounded-md px-2 py-1 text-xs ${
                message.role === "user"
                  ? "ml-auto max-w-[85%] bg-primary text-primary-foreground"
                  : "mr-auto max-w-[90%] bg-card"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSend()}
            placeholder="Ask GreenHealth AI..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
