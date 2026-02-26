import { motion } from "framer-motion";
import { Activity, BarChart3, Recycle, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const heroCards = [
  {
    title: "Energy Intelligence",
    description: "Track department energy trends with minute-level telemetry.",
    icon: Zap
  },
  {
    title: "Waste Optimization",
    description: "Spot medical waste spikes before they become systemic.",
    icon: Recycle
  },
  {
    title: "Live Scoring",
    description: "Turn raw events into a single sustainability performance score.",
    icon: BarChart3
  }
];

export function HeroSection() {
  return (
    <section id="hero" className="relative px-6 pb-16 pt-20 md:px-10">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"
      >
        <Activity className="h-3.5 w-3.5" />
        GreenHealth AI Platform
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl text-4xl font-semibold leading-tight text-slate-900 md:text-5xl"
      >
        Making Hospitals Sustainable with Real-Time AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mt-5 max-w-2xl text-lg text-slate-600 md:text-xl"
      >
        Monitor. Analyze. Improve.
      </motion.p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {heroCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.08 * index }}
            >
              <Card className="group h-full rounded-2xl border-emerald-100/80 bg-white/90 p-5 shadow-[0_16px_38px_-28px_rgba(16,185,129,0.7)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-24px_rgba(16,185,129,0.65)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-md shadow-emerald-200/80">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
