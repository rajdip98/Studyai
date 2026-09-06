import type { Config } from "tailwindcss";

// Design tokens sourced from the Prakriti Healthcare ("Botanical Veda")
// brand design system — see ../docs/DESIGN.md.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        primary: { DEFAULT: "#1B4D3E", dark: "#0F5132", container: "#1b4d3e" },
        secondary: { DEFAULT: "#38A169" },
        gold: { DEFAULT: "#C5A059", dark: "#AA8743", light: "#E8D5A3" },
        charcoal: "#262626",
        surface: {
          cream: "#FCF6EA",
          subtle: "#F4F7F4",
          pure: "#FFFFFF",
          variant: "#e4e2e1",
        },
        border: { earth: "#E5E1D8" },
        muted: "#686D65",
        "on-surface-variant": "#404945",
        "on-primary-container": "#8abda9",
        "secondary-fixed": "#91f8b8",
        "leaf-vibrant": "#2E7D32",
        sale: "#B9382B",
      },
      fontFamily: {
        serif: ["'Noto Serif'", "serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        base: "4px",
        interactive: "8px",
      },
      boxShadow: {
        level1: "0 2px 8px -2px rgba(27, 77, 62, 0.05)",
        level2: "0 12px 24px -6px rgba(27, 77, 62, 0.08), 0 4px 8px -2px rgba(27, 77, 62, 0.03)",
        level3: "0 20px 32px -8px rgba(15, 81, 50, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.04)",
      },
      maxWidth: { container: "1280px" },
    },
  },
  plugins: [],
} satisfies Config;
