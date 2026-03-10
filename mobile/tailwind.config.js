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
          bg: '#080c14',        // Deep Space Navy
          surface: '#111827',   // Rich Navy Surface
          border: '#1e293b',    // Soft Navy Border
          text: '#f8fafc',      // Crystal White
          textMuted: '#64748b', // Refined Muted Slate
        }
      }
    },
  },
  plugins: [],
}
