/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': 'var(--bg-dark)',
        'bg-glass': 'var(--bg-glass)',
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-glow': 'var(--accent-glow)',
        'accent-subtle': 'var(--accent-subtle)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border-glass': 'var(--border-glass)'
      },
      borderRadius: {
        'lg-radius': '16px'
      },
      fontFamily: {
        'main': ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
