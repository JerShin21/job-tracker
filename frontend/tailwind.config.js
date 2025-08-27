/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#eefcf5',100:'#d7f6e6',200:'#b0edcd',300:'#7fe2b0',
          400:'#4ed792',500:'#2fcf7e',600:'#22a564',700:'#1a8050',
          800:'#166742',900:'#124f34'
        }
      }
    },
  },
  plugins: [],
}
