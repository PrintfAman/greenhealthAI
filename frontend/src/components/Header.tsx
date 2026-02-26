import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Leaf, Hospital } from "lucide-react";

export function Header() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            GreenHealth AI
          </p>
          <h1 className="text-lg font-semibold">
            {greeting}, Sustainability Team
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right text-xs sm:block">
          <p className="font-medium">St. Veronica Medical Center</p>
          <p className="text-muted-foreground">Environmental Stewardship</p>
        </div>
        <Avatar className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-xs font-semibold text-white">
          <AvatarFallback>
            <Hospital className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

