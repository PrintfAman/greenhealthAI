import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  score: number;
};

export function SustainabilityScore({ score }: Props) {
  const normalized = Math.max(0, Math.min(100, score));
  const strokeDasharray = `${normalized}, 100`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sustainability score</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 36 36" className="h-full w-full">
            <path
              className="text-emerald-100"
              stroke="currentColor"
              strokeWidth="3.8"
              fill="none"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500"
              stroke="currentColor"
              strokeWidth="3.8"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold">
              {normalized.toFixed(0)}
            </span>
            <span className="text-[11px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground md:text-sm">
          Higher scores indicate lower energy, waste, and paper intensity across
          departments over the last 15 minutes.
        </p>
      </CardContent>
    </Card>
  );
}

