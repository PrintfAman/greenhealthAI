import { motion } from "framer-motion";
import { ArrowDownRight, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";

const impactMetrics = [
  { label: "Reduce energy usage", value: 72 },
  { label: "Reduce waste", value: 64 },
  { label: "Reduce carbon footprint", value: 58 },
  { label: "Digitize records", value: 81 }
];

export function ImpactSection() {
  return (
    <section id="impact" className="px-6 py-16 md:px-10">
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.42 }}
        className="text-3xl font-semibold text-slate-900 md:text-4xl"
      >
        Helping the Planet
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.42, delay: 0.12 }}
        className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600"
      >
        Sustainability is operationalized into measurable outcomes that leadership and
        facility teams can track together.
      </motion.p>

      <Card className="mt-8 rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-[0_26px_60px_-42px_rgba(16,185,129,0.8)]">
        <div className="mb-6 flex items-center gap-2 text-emerald-700">
          <Leaf className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.16em]">
            Environmental Impact Projection
          </span>
        </div>

        <div className="space-y-5">
          {impactMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                <span>{metric.label}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <ArrowDownRight className="h-4 w-4" />
                  {metric.value}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100/70">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.value}%` }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.08 * index }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </section>
  );
}
