/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#171818',
        'cosmic-green': '#c1ffce',
        warning: '#fef08a'
      },
    },
  },
  plugins: [],
}

