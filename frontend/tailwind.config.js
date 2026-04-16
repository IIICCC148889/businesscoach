/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 60px rgba(0, 0, 0, 0.28)'
      },
      colors: {
        app: '#020617',
        panel: '#0f172a',
        panelAlt: '#111827',
        ink: '#e5e7eb',
        mutedInk: '#94a3b8',
        borderSoft: '#1e293b',
        accent: '#2563eb',
        positive: '#34d399',
        warning: '#f59e0b',
        danger: '#f87171'
      }
    }
  },
  plugins: []
};
