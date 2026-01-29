/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        nautic: {
          primary: '#0B4F9C', // Deep ocean blue
          secondary: '#E6F0F9', // Very light blue for backgrounds
          accent: '#00B4D8', // Bright aqua/cyan for highlights
          white: '#FFFFFF',
          text: '#1E293B', // Dark slate for readable text
          lightText: '#64748B', // Muted text
          bg: '#F1F5F9', // App background (light mode)
          surface: '#FFFFFF', // Card background (light mode)
        },
        dashboard: {
          navy: '#1a2236',
          orange: '#ff6b00',
          bg: '#f8fafc',
        },
        // Dark mode colors (matching web)
        dark: {
          bg: '#0f172a',        // slate-900 - Main background
          surface: '#1e293b',   // slate-800 - Card/surface background
          border: '#334155',    // slate-700 - Borders
          text: '#f1f5f9',      // slate-100 - Primary text
          textMuted: '#94a3b8', // slate-400 - Secondary text
        }
      }
    },
  },
  plugins: [],
}
