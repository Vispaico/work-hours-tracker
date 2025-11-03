/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // A deep blue
        secondary: '#3b82f6', // A lighter, vibrant blue
        accent: '#10b981', // A teal/green for positive actions
        neutral: '#f3f4f6', // Light gray background
        dark: '#1f2937', // Dark gray for text
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}