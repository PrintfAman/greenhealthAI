import { motion } from "framer-motion";
import { BellRing, Gauge, ScanLine, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const solutions = [
  {
    title: "Real-time monitoring",
    copy: "Ingest live operational telemetry across departments with continuous updates.",
    icon: ScanLine
  },
  {
    title: "Sustainability scoring",
    copy: "Convert fragmented readings into a transparent score for daily decision making.",
    icon: Gauge
  },
  {
    title: "Smart alerts",
    copy: "Trigger actionable notifications when energy, waste, or paper exceeds thresholds.",
    icon: BellRing
  },
  {
    title: "AI recommendations",
    copy: "Generate practical, policy-aware sustainability guidance for teams on the floor.",
    icon: Sparkles
  }
];

export function SolutionSection() {
  return (
    <section id="solution" className="px-6 py-16 md:px-10">
      <motion.h2
        initial={{ opacity: 0, x: 26 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45 }}
        className="text-3xl font-semibold text-slate-900 md:text-4xl"
      >
        Our Solution
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, x: 26 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600"
      >
        GreenHealth AI combines streaming analytics with AI guidance to make sustainability
        measurable, accountable, and operationally useful.
      </motion.p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {solutions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <Card className="h-full rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-green-50/70 p-5 shadow-[0_20px_45px_-35px_rgba(16,185,129,0.8)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.copy}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
