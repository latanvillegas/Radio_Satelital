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
        'bg-dark': '#05070a',
        'bg-glass': 'rgba(18,20,26,0.95)',
        'accent': '#d32f2f',
        'accent-hover': '#b71c1c',
        'text-muted': '#cbd5e1'
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
