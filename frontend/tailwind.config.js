/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: "#003366", // Republic of Moldova Blue
          "blue-dark": "#0B3B60",
          gold: "#F2A900", // Republic of Moldova Gold
          "gold-dark": "#E5A823",
          primary: "#0F172A", // Accessible Dark
          secondary: "#334155",
          cta: "#0369A1", // High contrast CTA
          "cta-hover": "#0284C7",
          bg: "#F8FAFC",
          text: "#020617",
          border: "#E2E8F0"
        }
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', 'sans-serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
