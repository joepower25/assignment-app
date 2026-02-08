import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}", "./src/**/*.{js,jsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fbf7f2",
          200: "#f4e9dc",
        },
        ink: {
          950: "#0b0f19",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-merriweather)", "ui-serif", "Georgia"],
      },
      boxShadow: {
        soft: "0 20px 80px rgba(15,23,42,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
