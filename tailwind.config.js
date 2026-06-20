/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D7377',
          light: '#10908F',
          dark: '#095B5E',
        },
        accent: {
          DEFAULT: '#E8634A',
          light: '#F0846F',
        },
        dental: {
          bg: '#FAFAF8',
          card: '#FFFFFF',
          muted: '#E8E8E6',
          border: '#DFE6E9',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'Georgia', 'serif'],
        sans: ['Noto Sans SC', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
