/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#002147",
        "primary-hover": "#0A2E5C",
        "primary-accent": "#1E3A8A",
        "muted-foreground": "#6b7280",
      },
    },
  },
  plugins: [],
};

