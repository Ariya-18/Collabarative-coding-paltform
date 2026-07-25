/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        card: "#111827",
        primary: "#6366F1",
        secondary: "#8B5CF6",
        accent: "#06B6D4",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        muted: "#9CA3AF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        "wave-move": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.15)" },
        },
      },
      animation: {
        "wave-slow": "wave-move 22s linear infinite",
        "wave-medium": "wave-move 14s linear infinite reverse",
        "wave-fast": "wave-move 9s linear infinite",
        "pulse-glow": "pulse-glow 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};