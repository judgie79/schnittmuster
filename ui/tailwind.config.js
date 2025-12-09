/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Clean, readable font
      },
    },
  },
  plugins: [],
}
