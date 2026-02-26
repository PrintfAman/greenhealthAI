import { motion } from "framer-motion";
import { ArrowRight, Leaf, LineChart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/sections/CtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { TechnologySection } from "@/components/sections/TechnologySection";

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Technology", href: "#technology" },
  { label: "Impact", href: "#impact" }
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100/60">
      <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-16 h-72 w-72 rounded-full bg-green-300/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col lg:flex-row">
        <aside className="relative overflow-hidden border-b border-emerald-900/10 bg-slate-900 text-white lg:fixed lg:bottom-0 lg:left-0 lg:top-0 lg:w-[38%] lg:border-b-0 lg:border-r lg:border-emerald-900/20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(52,211,153,0.35),transparent_48%),radial-gradient(circle_at_80%_75%,rgba(16,185,129,0.25),transparent_46%)]" />

          <div className="relative flex h-full flex-col justify-between p-8 md:p-12 lg:p-14">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                GreenHealth AI
              </p>
              <h1 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
                Real-Time Healthcare Sustainability Intelligence
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-200/90 md:text-base">
                GreenHealth AI helps hospitals reduce environmental impact by monitoring
                energy usage, waste generation and paper consumption in real-time using
                streaming analytics and AI.
              </p>

              <Button
                asChild
                size="lg"
                className="mt-7 rounded-full bg-emerald-500 px-7 text-slate-950 hover:bg-emerald-400"
              >
                <Link to="/dashboard" className="inline-flex items-center gap-2">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-col gap-5">
              <div className="relative h-28 w-28">
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-emerald-300/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, ease: "linear", repeat: Infinity }}
                />
                <motion.div
                  aria-hidden
                  className="absolute inset-3 rounded-full border border-dashed border-emerald-200/70"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 14, ease: "linear", repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-500/30">
                    <Leaf className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100/20 bg-white/10 p-3">
                  <LineChart className="mb-2 h-5 w-5 text-emerald-300" />
                  <p className="text-xs text-emerald-100">Live sustainability telemetry</p>
                </div>
                <div className="rounded-2xl border border-emerald-100/20 bg-white/10 p-3">
                  <ShieldCheck className="mb-2 h-5 w-5 text-emerald-300" />
                  <p className="text-xs text-emerald-100">Policy-aware AI guidance</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative w-full lg:ml-[38%] lg:w-[62%]">
          <div className="h-full lg:h-screen lg:overflow-y-auto lg:scroll-smooth">
            <header className="sticky top-0 z-30 border-b border-emerald-100/90 bg-white/85 px-6 py-4 backdrop-blur-md md:px-10">
              <div className="flex items-center justify-between gap-4">
                <Link to="/" className="text-sm font-semibold text-emerald-700">
                  GreenHealth AI
                </Link>
                <nav className="flex items-center gap-1 md:gap-2">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 md:text-sm"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Link
                    to="/dashboard"
                    className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 md:text-sm"
                  >
                    Dashboard
                  </Link>
                </nav>
              </div>
            </header>

            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <TechnologySection />
            <ImpactSection />
            <HowItWorksSection />
            <CtaSection />
          </div>
        </main>
      </div>
    </div>
  );
}
