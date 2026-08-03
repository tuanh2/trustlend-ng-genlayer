/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        dark: {
          base: '#0B0F19',
          card: '#131C2E',
          border: '#1E2D4A',
          muted: '#64748B',
        }
      },
    },
  },
  plugins: [],
}
