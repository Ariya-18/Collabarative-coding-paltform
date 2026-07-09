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
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};