import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        card: "#151515",
        border: "#2A2A2A",
        gold: "#C99A32",
        lightGold: "#F3D36B",
        text: "#FFFFFF",
        muted: "#B8B8B8"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(201, 154, 50, 0.18), 0 24px 64px rgba(0, 0, 0, 0.45)"
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"]
      },
      backgroundImage: {
        panel:
          "radial-gradient(circle at top, rgba(243, 211, 107, 0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0))"
      }
    }
  },
  plugins: []
};

export default config;
