/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#112240',
        'sidebar-text': '#94a3b8',
        'accent-orange': '#f59e0b',
        'accent-blue': '#1e40af',
        bg: '#f1f5f9',
      }
    },
  },
  plugins: [],
}
