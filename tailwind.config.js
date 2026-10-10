/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/web/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // T17 semantic layer — single naming authority for new UI
        // (Takosan Redesign OS v2.0.0 design-tokens.json). rgb channels keep
        // alpha modifiers (bg-semantic-action-primary/10) working.
        semantic: {
          "background": "rgb(var(--semantic-background-rgb, 255 248 243) / <alpha-value>)",
          "background-subtle": "rgb(var(--semantic-background-subtle-rgb, 252 251 248) / <alpha-value>)",
          "surface": "rgb(255 255 255 / <alpha-value>)",
          "surface-raised": "rgb(255 255 255 / <alpha-value>)",
          "text-primary": "rgb(var(--semantic-text-primary-rgb, 31 41 55) / <alpha-value>)",
          "text-secondary": "rgb(var(--semantic-text-secondary-rgb, 74 71 65) / <alpha-value>)",
          // Kit value #7B776F measures 4.24:1 on --semantic-background (fails
          // WCAG AA body text); darkened to #6F6B64 (5.04:1) — see T17 report.
          "text-muted": "rgb(var(--semantic-text-muted-rgb, 111 107 100) / <alpha-value>)",
          "text-inverse": "rgb(255 255 255 / <alpha-value>)",
          "action-primary": "rgb(var(--semantic-action-primary-rgb, 46 125 91) / <alpha-value>)",
          "action-primary-hover": "rgb(var(--semantic-action-primary-hover-rgb, 36 102 72) / <alpha-value>)",
          "action-primary-pressed": "rgb(var(--semantic-action-primary-pressed-rgb, 29 85 61) / <alpha-value>)",
          "on-action-primary": "rgb(255 255 255 / <alpha-value>)",
          "accent": "rgb(255 123 107 / <alpha-value>)",
          "accent-soft": "rgb(255 240 237 / <alpha-value>)",
          "success": "rgb(var(--semantic-success-rgb, 46 125 91) / <alpha-value>)",
          "success-soft": "rgb(var(--semantic-success-soft-rgb, 231 245 236) / <alpha-value>)",
          "warning": "rgb(182 106 9 / <alpha-value>)",
          "warning-soft": "rgb(255 243 214 / <alpha-value>)",
          // Derived text shades for use on the *-soft fills where the base
          // hue falls under 4.5:1 (warning 3.77, danger 4.498). Not kit values.
          "warning-strong": "rgb(143 83 7 / <alpha-value>)",
          "danger": "rgb(201 61 61 / <alpha-value>)",
          "danger-soft": "rgb(255 240 240 / <alpha-value>)",
          "danger-strong": "rgb(181 52 52 / <alpha-value>)",
          "info": "rgb(47 111 159 / <alpha-value>)",
          "info-soft": "rgb(234 244 251 / <alpha-value>)",
          "border": "rgb(var(--semantic-border-rgb, 231 227 218) / <alpha-value>)",
          "border-strong": "rgb(201 194 182 / <alpha-value>)",
          "focus": "rgb(var(--semantic-focus-rgb, 46 125 91) / <alpha-value>)",
          // Scrim colour from design-tokens.json (--semantic-overlay); alpha
          // is supplied per use (bg-semantic-overlay/50).
          "overlay": "rgb(18 25 23 / <alpha-value>)",
        },
        // Takosan locked palette (design-tokens/brand-tokens.json v1.1.0) plus a few
        // derived shades for hover/depth/borders so runtime UI never falls back to emerald.
        takosan: {
          coral: { DEFAULT: "#FF7B6B", deep: "#E8624F", soft: "#FFE6E1" },
          green: { DEFAULT: "rgb(var(--takosan-green-color-rgb, 46 125 91) / <alpha-value>)", hover: "rgb(var(--takosan-green-hover-color-rgb, 38 105 76) / <alpha-value>)", deep: "rgb(var(--takosan-green-deep-color-rgb, 31 86 62) / <alpha-value>)" },
          navy: "rgb(var(--takosan-navy-color-rgb, 31 41 55) / <alpha-value>)",
          cream: { DEFAULT: "rgb(var(--takosan-cream-color-rgb, 255 248 243) / <alpha-value>)", deep: "#FFF1E8", line: "rgb(var(--takosan-cream-line-color-rgb, 243 228 218) / <alpha-value>)", shade: "#F6EEE8" },
          mint: { DEFAULT: "rgb(var(--takosan-mint-color-rgb, 223 244 230) / <alpha-value>)", hover: "#CFEDDA", deep: "rgb(var(--takosan-mint-deep-color-rgb, 191 227 204) / <alpha-value>)" },
          yellow: "#FFC857",
        },
        // Legacy Frigo palette names kept as aliases onto Takosan values (no runtime
        // utility uses them today; retained so stray legacy classes cannot re-introduce emerald).
        frigo: {
          green: {
            DEFAULT: "#2E7D5B",
            50: "#DFF4E6",
            100: "#CFEDDA",
            200: "#BFE3CC",
            300: "#8FCBA8",
            400: "#5FA985",
            500: "#3E8F6B",
            600: "#2E7D5B",
            700: "#26694C",
            800: "#1F563E",
            900: "#17422F",
          },
          deep: {
            DEFAULT: "#1F563E",
            light: "#26694C",
            dark: "#17422F",
          },
          forest: {
            DEFAULT: "#1F563E",
            light: "#26694C",
            dark: "#17422F",
          },
          mint: {
            DEFAULT: "#DFF4E6",
            light: "#EEF9F2",
            dark: "#BFE3CC",
          },
          cream: {
            DEFAULT: "#FFF8F3",
            warm: "#FFF1E8",
          },
          surface: "#FFFFFF",
          border: "#E2E8F0",
          tomato: {
            DEFAULT: "#E11D48",
            light: "#FFE4E6",
          },
          yellow: {
            DEFAULT: "#D97706",
            light: "#FEF3C7",
          },
        },
      },
      fontFamily: {
        heading: ["var(--takosan-font-ui)", "sans-serif"],
        body: ["var(--takosan-font-ui)", "sans-serif"],
        sans: ["var(--takosan-font-ui)", "sans-serif"],
      },
      // T17 type scale (design-system/typography.json) — size/line-height/weight triples.
      fontSize: {
        "type-display": ["36px", { lineHeight: "43px", fontWeight: "800", letterSpacing: "-0.02em" }],
        "type-title": ["24px", { lineHeight: "31px", fontWeight: "700", letterSpacing: "-0.01em" }],
        "type-heading": ["20px", { lineHeight: "27px", fontWeight: "700" }],
        "type-body-lg": ["16px", { lineHeight: "24px" }],
        "type-label": ["13px", { lineHeight: "18px", fontWeight: "700" }],
        "type-caption": ["12px", { lineHeight: "18px", fontWeight: "500" }],
      },
      borderRadius: {
        "lg": "10px",
        "xl": "12px",
        "2xl": "16px",
        "3xl": "20px",
        // T17 radius scale (design-system/radius.json) — additive keys;
        // legacy rounded-* values above stay untouched.
        "card": "16px",
        "feature": "24px",
        "hero": "32px",
        "pill": "9999px",
      },
      // Fractional spacing used across the UI (w-4.5, w-12.5...) — without these
      // Tailwind silently drops the class and icons render at default size.
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "12.5": "3.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "17": "4.25rem",
        "18": "4.5rem",
      },
      boxShadow: {
        "xs": "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        "soft": "0 2px 10px -1px rgba(15, 23, 42, 0.05)",
        "card": "0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.05)",
        "elevated": "0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -4px rgba(15, 23, 42, 0.04)",
        // Brand-tinted shadows derive from Takosan green rgb(46, 125, 91).
        "float": "0 8px 20px -3px rgba(46, 125, 91, 0.22), 0 3px 6px -2px rgba(46, 125, 91, 0.12)",
        "glow": "0 0 0 4px rgba(46, 125, 91, 0.15), 0 8px 20px -3px rgba(46, 125, 91, 0.30)",
        // T17 elevation + focus ring (design-system/elevation.json) — additive keys.
        "t17-sm": "0 1px 2px rgba(31, 41, 55, 0.06)",
        "t17-md": "0 8px 24px rgba(31, 41, 55, 0.10)",
        "t17-lg": "0 18px 48px rgba(31, 41, 55, 0.14)",
        "t17-focus": "0 0 0 3px rgba(46, 125, 91, 0.28)",
      },
      // T17 scoped interactive transition (motion/micro-interactions.md):
      // explicitly enumerated properties — layout (width/height/padding) is
      // never transitioned, unlike indiscriminate `transition-all`.
      transitionProperty: {
        tap: "transform, background-color, border-color, color, box-shadow, opacity",
      },
    },
  },
  plugins: [],
}
