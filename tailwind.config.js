/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#e50611",
        "primary-light": "#ffccd0",
        "primary-dark": "#b0040c",
        "background-light": "#f8f5f6",
        "background-dark": "#230f10",
        "surface-light": "#ffffff",
        "surface-dark": "#2d1b1c",
        "border-light": "#e2e8f0",
        "border-dark": "#3f2e2f",
        "text-light": "#1e293b",
        "text-dark": "#e2e8f0",
        "subtext-light": "#64748b",
        "subtext-dark": "#94a3b8",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
