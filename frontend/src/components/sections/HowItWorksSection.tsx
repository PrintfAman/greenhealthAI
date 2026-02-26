import { motion } from "framer-motion";
import { BadgeCheck, Database, Sparkles, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    title: "Data Collection",
    text: "Live telemetry arrives from operational systems and monitored departments.",
    icon: Database
  },
  {
    title: "Pathway Processing",
    text: "Streaming events are transformed into rolling insights and anomaly signals.",
    icon: Workflow
  },
  {
    title: "Sustainability Score",
    text: "Department-level metrics are normalized into actionable scorecards.",
    icon: BadgeCheck
  },
  {
    title: "AI Insights",
    text: "Copilot synthesizes live context with policy knowledge for practical guidance.",
    icon: Sparkles
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-16 md:px-10">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-semibold text-slate-900 md:text-4xl"
      >
        How It Works
      </motion.h2>

      <div className="relative mt-9 space-y-4 md:space-y-0 md:pb-8">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="absolute left-8 right-8 top-7 hidden h-[2px] origin-left bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 md:block"
        />

        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.38, delay: index * 0.09 }}
              >
                <Card className="relative h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-400 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.text}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
