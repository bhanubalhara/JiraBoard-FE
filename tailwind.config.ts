import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [animatePlugin],
} satisfies Config; 