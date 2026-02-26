import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string;
  delta?: string;
  helper?: string;
};

export function KpiCards({ items }: { items: KpiCardProps[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-none bg-secondary/60">
          <CardHeader>
            <CardTitle>{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-lg font-semibold md:text-xl">{item.value}</p>
            {item.delta && (
              <p className="text-xs text-emerald-600">{item.delta}</p>
            )}
            {item.helper && (
              <p className="text-[11px] text-muted-foreground">{item.helper}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

