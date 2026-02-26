import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricPoint = {
  timestamp: string;
  value: number;
};

type Props = {
  energySeries: MetricPoint[];
  wasteSeries: MetricPoint[];
};

export function RealTimeCharts({ energySeries, wasteSeries }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Energy usage (kWh)</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={energySeries}>
              <XAxis dataKey="timestamp" hide />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Medical waste (kg)</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wasteSeries}>
              <XAxis dataKey="timestamp" hide />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

