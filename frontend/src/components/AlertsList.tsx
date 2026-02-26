import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Alert = {
  id: string;
  type: string;
  department: string;
  severity: "low" | "medium" | "high";
  message: string;
  created_at: string;
};

const severityColor: Record<Alert["severity"], string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700"
};

export function AlertsList({ alerts }: { alerts: Alert[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {alerts.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No active anomalies detected.
          </p>
        )}
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between rounded-md border border-border bg-secondary/40 p-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColor[alert.severity]}`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {alert.department}
                  </span>
                </div>
                <p className="text-xs">{alert.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(alert.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

