/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#1a1a2e',           // Dark navy blue
          'bg-light': '#16213e',   // Slightly lighter navy
          'bg-dark': '#0f0f1e',    // Deeper blue-black

          primary: '#4ecca3',      // Muted teal/cyan
          secondary: '#6c5ce7',    // Soft purple
          accent: '#fd79a8',       // Muted pink

          success: '#00b894',      // Professional green
          warning: '#fdcb6e',      // Soft yellow
          danger: '#d63031',       // Muted red
          info: '#74b9ff',         // Light blue

          text: '#e8e8e8',         // Off-white
          'text-dim': '#a0a0a0',   // Gray
          'text-darker': '#6b6b6b', // Darker gray

          border: '#2d3561',       // Muted blue border
          'border-light': '#3e4a7f', // Lighter border
        },
      },
      fontFamily: {
        pixel: ['Courier New', 'Monaco', 'monospace'],
        mono: ['Monaco', 'Consolas', 'monospace'],
      },
      borderWidth: {
        'pixel': '2px',
      },
      boxShadow: {
        'pixel': '3px 3px 0px 0px rgba(0, 0, 0, 0.3)',
        'pixel-lg': '4px 4px 0px 0px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 8px rgba(78, 204, 163, 0.3)',
        'glow-lg': '0 0 12px rgba(78, 204, 163, 0.4)',
      },
    },
  },
  plugins: [],
}
