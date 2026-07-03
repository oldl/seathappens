import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        cream: "#FBF3E7",
        ink: "#1A1A1A",
        sh: {
          purple: "#8A7CFB",
          yellow: "#FFD93D",
          blue: "#3E6CF4",
          pink: "#FF6FA5",
          green: "#3ECF8E",
          orange: "#FF7A45",
        },
      },
    },
  },
  plugins: [],
};

export default config;
