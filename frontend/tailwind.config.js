/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        evo: {
          bg: "#F8F9FA",
          surface: "#FFFFFF",
          navy: "#0F172A",
          "navy-light": "#1E293B",
          cobalt: "#2563EB",
          "cobalt-dark": "#1D4ED8",
          "cobalt-light": "#EFF6FF",
          cyan: "#06B6D4",
          "cyan-light": "#ECFEFF",
          "text-main": "#111827",
          "text-muted": "#6B7280",
          "text-subtle": "#9CA3AF",
          border: "#E5E7EB",
          "border-light": "#F3F4F6",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444"
        },
        // Keep gov mapping for compatibility while pointing to EVO tokens
        gov: {
          blue: "#0F172A",
          "blue-dark": "#0B132B",
          gold: "#06B6D4",
          primary: "#111827",
          secondary: "#4B5563",
          cta: "#2563EB",
          "cta-hover": "#1D4ED8",
          bg: "#F8F9FA",
          text: "#111827",
          border: "#E5E7EB"
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'evo-soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'evo-card': '0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.02)',
        'evo-glow': '0 0 20px rgba(37, 99, 235, 0.15)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
