import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section id="cta" className="px-6 pb-16 pt-12 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-100 p-8 text-center shadow-[0_32px_80px_-48px_rgba(16,185,129,0.9)]"
      >
        <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
          Start Monitoring Sustainability Today
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
          Shift from monthly reporting to continuous, department-level intelligence and
          guided action.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-8 rounded-full bg-emerald-600 px-8 text-white transition hover:bg-emerald-700"
        >
          <Link to="/dashboard" className="inline-flex items-center gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
