import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff7ef",
        blush: "#ffe8e3",
        tea: "#f5d6b4",
        ink: "#342f2b",
        cocoa: "#7c5b48",
        mint: "#d9efe3",
        berry: "#c7687e",
        sun: "#f5b85b"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(124, 91, 72, 0.13)"
      }
    }
  },
  plugins: []
};

export default config;
