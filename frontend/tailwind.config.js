/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { light: '#6366F1', dark: '#8e7bbd' },
        success: { light: '#10B981', dark: '#48b470' },
        danger:  { light: '#EF4444', dark: '#cc6464' },
      },
    },
  },
  plugins: [],
};
