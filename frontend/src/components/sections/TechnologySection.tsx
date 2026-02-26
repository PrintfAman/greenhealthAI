import { motion } from "framer-motion";
import { Bot, Boxes, Cable, Cpu, Server } from "lucide-react";
import { Card } from "@/components/ui/card";

const techStack = [
  { name: "Pathway Streaming Engine", icon: Cable },
  { name: "FastAPI Backend", icon: Server },
  { name: "Real-Time Analytics", icon: Cpu },
  { name: "AI Copilot", icon: Bot },
  { name: "Docker Deployment", icon: Boxes }
];

export function TechnologySection() {
  return (
    <section id="technology" className="px-6 py-16 md:px-10">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45 }}
        className="text-3xl font-semibold text-slate-900 md:text-4xl"
      >
        Powered by Real-Time AI
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600"
      >
        The platform is built for hackathon speed and production-grade architecture.
      </motion.p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {techStack.map((tech, index) => {
          const Icon = tech.icon;
          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.38, delay: index * 0.06 }}
            >
              <Card className="flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-800">{tech.name}</span>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
