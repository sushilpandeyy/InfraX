/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e1a',
          card: '#0f172a',
          border: 'rgba(59, 130, 246, 0.2)',
        },
        blue: {
          primary: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}