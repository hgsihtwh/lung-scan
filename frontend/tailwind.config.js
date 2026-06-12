/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          beige: 'var(--color-bg)',
          navy: 'var(--color-navy)',
          navyDark: 'var(--color-navy-dark)',
          dark: 'var(--color-text)',
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};
