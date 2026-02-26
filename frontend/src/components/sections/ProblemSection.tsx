import { motion } from "framer-motion";
import { Bolt, Cloud, FileText, Recycle } from "lucide-react";
import { Card } from "@/components/ui/card";

const problemCards = [
  {
    title: "Energy Waste",
    detail:
      "Clinical operations run 24/7, and inefficiencies in HVAC and equipment usage multiply costs.",
    icon: Bolt
  },
  {
    title: "Medical Waste",
    detail:
      "Disposal streams grow quickly, especially in high-throughput departments with strict regulations.",
    icon: Recycle
  },
  {
    title: "Paper Usage",
    detail:
      "Manual forms and fragmented workflows increase paper dependency and operational friction.",
    icon: FileText
  },
  {
    title: "Carbon Impact",
    detail:
      "Combined waste and energy patterns increase total emissions and reduce sustainability outcomes.",
    icon: Cloud
  }
];

export function ProblemSection() {
  return (
    <section id="problem" className="px-6 py-16 md:px-10">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-semibold text-slate-900 md:text-4xl"
      >
        The Problem
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600"
      >
        Hospitals generate high energy consumption, medical waste, paper waste, and
        avoidable carbon emissions. Without continuous visibility, teams react too late.
      </motion.p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {problemCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="h-full rounded-2xl border border-slate-200 bg-white/90 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-100/70">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
