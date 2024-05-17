/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3366FF',
        'primary-light': '#FAFCFD',
        black: '#212327',
        text: '#101012',
        'text-dark': '#FBFAFC',
        'black-light': '#14161A',
        light: '#E5EDF5',
        'dark-blue': '#0D2159',
        icon: '#1e1e1e'
      },
      width: {
        page: '1240px'
      },
      fontFamily: {
        sans: ['General Sans', 'sans-serif'],
        serif: ['ClashDisplay', 'serif']
      },
      borderRadius: {
        DEFAULT: '8px'
      }
    }
  },
  plugins: [require('tailwind-scrollbar')]
}
