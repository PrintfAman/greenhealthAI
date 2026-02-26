import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  FileText,
  Grid2x2,
  Recycle,
  Send,
  UserCircle2,
  Zap
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./DashboardPage.css";

type DepartmentMetric = {
  department: string;
  energy_kwh: number;
  medical_waste_kg: number;
  paper_kg: number;
  timestamp: string;
};

type Alert = {
  id: string;
  type: string;
  department: string;
  severity: "low" | "medium" | "high";
  message: string;
  created_at: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timeLabel: string;
  sourceCount: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const copilotSuggestions = [
  "Identify energy waste in ICU",
  "Show carbon offset progress",
  "Draft sustainability report"
];

function useBackendData() {
  const [metrics, setMetrics] = useState<DepartmentMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    let ws: WebSocket | null = null;

    const fetchRest = async () => {
      try {
        const [mRes, aRes, sRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/metrics`),
          axios.get(`${API_BASE_URL}/alerts`),
          axios.get(`${API_BASE_URL}/sustainability-score`)
        ]);
        setMetrics(mRes.data.metrics ?? []);
        setAlerts(aRes.data.alerts ?? []);
        setScore(sRes.data.overall_score ?? 0);
      } catch {
        // UI keeps last known state while backend is reconnecting.
      }
    };

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(API_BASE_URL.replace("http", "ws") + "/ws/metrics");
        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.metrics) {
              setMetrics(payload.metrics);
            }
          } catch {
            // Ignore malformed frame and continue polling fallback.
          }
        };
        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        // REST polling continues if websocket is unavailable.
      }
    };

    fetchRest();
    const restInterval = window.setInterval(fetchRest, 5000);
    connectWebSocket();

    return () => {
      window.clearInterval(restInterval);
      ws?.close();
    };
  }, []);

  return { metrics, alerts, score };
}

function formatTime(value: Date): string {
  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const { metrics, alerts, score } = useBackendData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "metrics" | "alerts" | "copilot"
  >("dashboard");

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  const kpis = useMemo(() => {
    const hasMetrics = metrics.length > 0;
    const energyAvg = hasMetrics
      ? metrics.reduce((sum, m) => sum + m.energy_kwh, 0) / metrics.length
      : 0;
    const wasteAvg = hasMetrics
      ? metrics.reduce((sum, m) => sum + m.medical_waste_kg, 0) / metrics.length
      : 0;
    const paperAvg = hasMetrics
      ? metrics.reduce((sum, m) => sum + m.paper_kg, 0) / metrics.length
      : 0;

    return [
      {
        label: "Energy Usage",
        value: hasMetrics ? `${energyAvg.toFixed(1)} kWh` : "-",
        helper: "Avg / department",
        icon: Zap
      },
      {
        label: "Medical Waste",
        value: hasMetrics ? `${wasteAvg.toFixed(1)} kg` : "-",
        helper: "Avg / department",
        icon: Recycle
      },
      {
        label: "Paper Usage",
        value: hasMetrics ? `${paperAvg.toFixed(1)} kg` : "-",
        helper: "Avg / department",
        icon: FileText
      },
      {
        label: "Active Alerts",
        value: `${alerts.length}`,
        helper: "Current anomalies",
        icon: Bell
      }
    ];
  }, [alerts.length, metrics]);

  const { energySeries, wasteSeries } = useMemo(() => {
    const sorted = [...metrics].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return {
      energySeries: sorted.map((m) => ({
        timestamp: new Date(m.timestamp).toLocaleTimeString([], {
          minute: "2-digit"
        }),
        value: m.energy_kwh
      })),
      wasteSeries: sorted.map((m) => ({
        timestamp: new Date(m.timestamp).toLocaleTimeString([], {
          minute: "2-digit"
        }),
        value: m.medical_waste_kg
      }))
    };
  }, [metrics]);

  const leaderboardRows = useMemo(() => {
    return [...metrics]
      .map((row) => {
        const efficiencyScore = Math.max(
          0,
          100 - row.energy_kwh * 0.1 - row.medical_waste_kg * 1.2 - row.paper_kg * 0.8
        );
        return {
          department: row.department,
          score: efficiencyScore,
          energy: row.energy_kwh,
          waste: row.medical_waste_kg
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [metrics]);

  const normalizedScore = Math.max(0, Math.min(100, score));

  const sendCopilotQuery = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
        timeLabel: formatTime(new Date()),
        sourceCount: 0
      }
    ]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/copilot-query`, { question });
      const sourceCount = Array.isArray(res.data?.sources) ? res.data.sources.length : 0;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          timeLabel: formatTime(new Date()),
          sourceCount
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I wasn't able to reach the GreenHealth AI backend. Please check the API service.",
          timeLabel: formatTime(new Date()),
          sourceCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gh-enterprise-page">
      <aside className="gh-enterprise-sidebar">
        <div className="gh-side-logo">
          <div className="gh-side-logo-icon">
            <Activity size={16} />
          </div>
          <div>
            <p className="gh-side-title">GreenHealth AI</p>
            <p className="gh-side-subtitle">Sustainability Suite</p>
          </div>
        </div>

        <nav className="gh-side-nav">
          <button
            type="button"
            className={`gh-side-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <Grid2x2 size={20} />
            <span>Dashboard</span>
          </button>
    
          <button
            type="button"
            className={`gh-side-item ${activeSection === "copilot" ? "active" : ""}`}
            onClick={() => setActiveSection("copilot")}
          >
            <Bot size={20} />
            <span>healer</span>
          </button>
        </nav>
      </aside>

      <section className="gh-enterprise-main">
        <header className="gh-top-header">
          <div className="gh-top-header-left">
            <h1>GreenHealth AI</h1>
          
          </div>

          <div className="gh-live-indicator">
            <span className="gh-live-dot" />
            Live Streaming Active
          </div>

          <div className="gh-top-header-right">
            <span className="gh-timezone">Timezone: {timezone}</span>
            <button type="button" className="gh-user-avatar" aria-label="User">
              <UserCircle2 size={20} />
            </button>
          </div>
        </header>

        <main className="gh-dashboard-grid">
          {activeSection !== "copilot" && (
            <>
              <section className="gh-kpi-row">
                {kpis.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.label} className="gh-kpi-card">
                      <div className="gh-kpi-head">
                        <span>{item.label}</span>
                        <span className="gh-kpi-icon">
                          <Icon size={16} />
                        </span>
                      </div>
                      <h3>{item.value}</h3>
                      <p>{item.helper}</p>
                    </article>
                  );
                })}
              </section>

              <section className="gh-second-row">
                <article className="gh-panel">
                  <p className="gh-panel-title">Energy Chart</p>
                  <div className="gh-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={energySeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7efe9" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2fbf71"
                          strokeWidth={2.8}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="gh-panel">
                  <p className="gh-panel-title">Waste Chart</p>
                  <div className="gh-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={wasteSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7efe9" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#1f9d5c"
                          strokeWidth={2.8}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>

                <article className="gh-panel gh-score-panel">
                  <p className="gh-panel-title">Sustainability Score</p>
                  <div className="gh-score-ring">
                    <div
                      className="gh-score-ring-progress"
                      style={{ width: `${normalizedScore}%` }}
                    />
                    <div className="gh-score-inner">{normalizedScore.toFixed(0)}</div>
                  </div>
                </article>
              </section>

              <section className="gh-third-row">
                <article className="gh-panel">
                  <p className="gh-panel-title">Department Leaderboard</p>
                  <div className="gh-leaderboard">
                    <div className="gh-leaderboard-head">
                      <span>Department</span>
                      <span>Score</span>
                      <span>Energy</span>
                      <span>Waste</span>
                    </div>
                    {leaderboardRows.length === 0 ? (
                      <p className="gh-empty-text">Waiting for department telemetry...</p>
                    ) : (
                      leaderboardRows.map((row) => (
                        <div key={row.department} className="gh-leaderboard-row">
                          <span>{row.department}</span>
                          <span>{row.score.toFixed(1)}</span>
                          <span>{row.energy.toFixed(1)} kWh</span>
                          <span>{row.waste.toFixed(1)} kg</span>
                        </div>
                      ))
                    )}
                  </div>
                </article>

                <article className="gh-panel">
                  <p className="gh-panel-title">Event Alerts</p>
                  <div className="gh-alert-stack">
                    {alerts.length === 0 ? (
                      <p className="gh-empty-text">No active alerts</p>
                    ) : (
                      alerts.map((alert) => (
                        <div key={alert.id} className="gh-alert-item">
                          <p>{alert.department}</p>
                          <span>{alert.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </section>
            </>
          )}

          {activeSection === "copilot" && (
            <section className="gh-copilot-row">
              <article className="gh-copilot-panel gh-copilot-only">
                <div className="gh-copilot-header">
                  <div>
                    <h2>City General Hospital - healer</h2>
                  </div>
                  <span className="gh-ready-badge">Copilot Ready</span>
                </div>

                <div className="gh-copilot-chat-area">
                  {messages.length === 0 && (
                    <p className="gh-empty-text">
                      Ask about energy patterns, carbon targets, or waste reduction plans.
                    </p>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`gh-chat-message ${message.role}`}
                    >
                      <div className="gh-chat-content">
                        {message.role === "assistant" && (
                          <span className="gh-chat-avatar">
                            <Bot size={14} />
                          </span>
                        )}
                        <div className="gh-chat-bubble">{message.content}</div>
                      </div>
                      <p className="gh-chat-meta">
                        {message.timeLabel} | Analyzed {message.sourceCount} data sources
                      </p>
                    </div>
                  ))}
                </div>

                <div className="gh-copilot-suggestions">
                  {copilotSuggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setInput(suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="gh-copilot-input-row">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && sendCopilotQuery()}
                    placeholder="Ask anything..."
                  />
                  <button type="button" onClick={sendCopilotQuery} disabled={loading}>
                    <Send size={16} />
                    {loading ? "Sending..." : "Send"}
                  </button>
                </div>
              </article>
            </section>
          )}

        </main>
      </section>
    </div>
  );
}
