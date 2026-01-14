/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-navy': '#1a2236', // Aproximación del azul oscuro del sidebar
        'dashboard-blue': '#293042', // Un tono más claro para items seleccionados o hover
        'dashboard-orange': '#ffa500', // Aproximación del naranja de acento
        'dashboard-gray': '#f5f6fa', // Fondo gris claro
      },
    },
  },
  plugins: [],
}