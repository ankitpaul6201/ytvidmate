import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
        },
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        bgLight: "#FFFFFF",
        bgDark: "#0B0F19",
        surfaceLight: "#F8FAFC",
        surfaceDark: "#131A2A",
        textLight: "#0F172A",
        textDark: "#E5E7EB",
      },
      borderRadius: {
        card: "12px",
        btn: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
