/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3366FF',
        black: '#171717',
        text: '#101012',
        'text-dark': '#FBFAFC',
        'black-light': '#242428',
        light: '#FAFCFD',
        'dark-blue': '#0D2159'
      },
      width: {
        page: '1240px'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
