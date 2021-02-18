const colors = require('tailwindcss/colors');

module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      red: colors.red,
      gray: colors.trueGray,
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
      primary: '#00666F',
      secondary: '#f1f1f1',
    }),
    borderColor: (theme) => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.300', 'currentColor'),
      primary: '#666B6E',
      secondary: '#00666F',
    }),
    textColor: (theme) => ({
      ...theme('colors'),
      primary: '#666B6E',
      secondary: '#00666F',
    }),
    extend: {},
  },
  variants: {
    extend: {
      display: ['hover'],
      fontWeight: ['hover'],
      transform: ['hover'],
    },
  },
  plugins: [
  ],
};
