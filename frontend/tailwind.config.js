/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#38bdf8',
          dark: '#0ea5e9',
        },
        secondary: {
          DEFAULT: '#818cf8',
          dark: '#6366f1',
        },
        background: {
          DEFAULT: '#0f172a',
          lighter: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
