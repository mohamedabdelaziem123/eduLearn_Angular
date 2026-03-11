/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#0f1f3d',
          800: '#1a3566',
          700: '#1e4080',
          600: '#2e5ab0',
          100: '#dde4f0',
          50:  '#f5f8ff',
        },
      },
    },
  },
  plugins: [],
};
