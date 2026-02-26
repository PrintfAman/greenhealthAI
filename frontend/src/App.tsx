import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));

const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 }
};

function RouteShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen"
    >
      <Suspense fallback={<div className="min-h-screen bg-emerald-50" />}>
        {children}
      </Suspense>
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <RouteShell>
              <LandingPage />
            </RouteShell>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RouteShell>
              <DashboardPage />
            </RouteShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
