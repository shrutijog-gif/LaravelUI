/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1d4ed8', // Main Sidebar Royal Blue
          'blue-hover': '#1e40af',
          'blue-active': '#2563eb',
          'blue-light': '#3b82f6',
          dark: '#0f172a',
          accent: '#7c3aed',
        }
      }
    },
  },
  plugins: [],
}
