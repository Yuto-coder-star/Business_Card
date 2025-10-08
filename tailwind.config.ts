import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "marutto-teal": "#46E1C2",
        "marutto-night": "#0B1622",
        "marutto-slate": "#162635",
      },
      backgroundImage: {
        "noir-grid":
          "radial-gradient(circle at 1px 1px, rgba(70, 225, 194, 0.2) 1px, transparent 0)",
      },
      boxShadow: {
        "glow-teal": "0 20px 60px rgba(70, 225, 194, 0.25)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
