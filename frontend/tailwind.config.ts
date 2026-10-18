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
          DEFAULT: "#2D8AF4",
          hover: "#2279E5",
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
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
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
