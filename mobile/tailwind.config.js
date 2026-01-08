/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dashboard: {
          navy: '#1a2236',
          orange: '#ff6b00',
          bg: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}
