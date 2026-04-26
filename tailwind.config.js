/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#101418',
        panel: '#171d23',
        panelSoft: '#202831',
        line: '#2e3844',
        mint: '#4ade80',
        coral: '#fb7185',
        amberFit: '#fbbf24',
        cyanFit: '#22d3ee',
      },
      boxShadow: {
        glow: '0 18px 60px rgba(0, 0, 0, 0.32)',
      },
    },
  },
  plugins: [],
};
