/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          black: '#0a0a0a',
          white: '#f5f5f5',
          red: '#dc2626',
          'red-light': '#ef4444',
          border: '#333333',
        },
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      borderWidth: {
        'vintage': '2px',
      },
    },
  },
  plugins: [],
}