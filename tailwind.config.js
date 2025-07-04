/** @type {import('tailwindcss').Config} */
export default  {
    darkMode: 'class', // 👈 para que funcione el modo oscuro por clase
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./index.html",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }