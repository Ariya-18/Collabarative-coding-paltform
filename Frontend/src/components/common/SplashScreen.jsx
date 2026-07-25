import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SplashScreen
 * Shown once on initial app load. Layered animated SVG waves in the
 * project's primary/secondary/accent blues, over the app's own
 * background color — so it blends seamlessly into the dashboard
 * underneath once it fades out.
 */
const SplashScreen = ({ onFinish, minDuration = 2400 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // wait for the exit fade before telling the app we're done
      setTimeout(onFinish, 700);
    }, minDuration);
    return () => clearTimeout(timer);
  }, [minDuration, onFinish]);

  // A single wave path, drawn twice side-by-side inside a 200%-wide
  // SVG. Animating translateX from 0 to -50% loops it seamlessly.
  const WAVE_PATH =
    "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,138.7C672,117,768,107,864,122.7C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* soft ambient glow behind the logo */}
          <div className="absolute h-72 w-72 rounded-full bg-primary/30 blur-[100px] animate-pulse-glow" />
          <div className="absolute h-72 w-72 translate-x-24 rounded-full bg-accent/20 blur-[110px] animate-pulse-glow" />

          {/* wave layers, back to front */}
          <div className="absolute inset-x-0 bottom-0 h-[45%] overflow-hidden">
            <svg
              className="absolute bottom-0 h-full w-[200%] animate-wave-slow"
              viewBox="0 0 2880 320"
              preserveAspectRatio="none"
            >
              <path d={WAVE_PATH} fill="#06B6D4" fillOpacity="0.18" />
              <path d={WAVE_PATH} fill="#06B6D4" fillOpacity="0.18" transform="translate(1440,0)" />
            </svg>

            <svg
              className="absolute bottom-0 h-full w-[200%] animate-wave-medium"
              viewBox="0 0 2880 320"
              preserveAspectRatio="none"
            >
              <path d={WAVE_PATH} fill="#8B5CF6" fillOpacity="0.28" />
              <path d={WAVE_PATH} fill="#8B5CF6" fillOpacity="0.28" transform="translate(1440,0)" />
            </svg>

            <svg
              className="absolute bottom-0 h-full w-[200%] animate-wave-fast"
              viewBox="0 0 2880 320"
              preserveAspectRatio="none"
            >
              <path d={WAVE_PATH} fill="#6366F1" fillOpacity="0.45" />
              <path d={WAVE_PATH} fill="#6366F1" fillOpacity="0.45" transform="translate(1440,0)" />
            </svg>
          </div>

          {/* logo + loading state */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-5xl font-bold tracking-tight text-transparent">
              CodeShare
            </h1>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted">
              Real-Time Collaborative Coding
            </p>

            <div className="mt-8 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;