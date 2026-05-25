/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-dark': '#1D4ED8',
        'primary-light': '#3B82F6',
        slate: {
          850: '#151e2e',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        khmer: ['var(--font-kantumruy)', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'Nunito Sans', 'sans-serif'],
      },
      boxShadow: {
        'lux': '0 4px 20px -4px rgba(0, 0, 0, 0.05)',
        'lux-deep': '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.3)',
      }
    },
  },
  plugins: [],
}
