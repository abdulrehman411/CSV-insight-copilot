/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "text-light": "#111418",
        "text-dark": "#f6f7f8",
        "border-light": "#dbe0e6",
        "border-dark": "#2a3644",
        "card-light": "#ffffff",
        "card-dark": "#1b2734",
        "subtle-light": "#617589",
        "subtle-dark": "#90a3b6",
        "custom-primary": "#2A4A7C",
        "custom-secondary": "#00C49A",
        "custom-text-primary": "#343A40",
        "custom-text-secondary": "#6C757D",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
}

