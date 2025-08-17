/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#e3f2fd',
            200: '#90caf9',
            DEFAULT: '#2196f3',
            dark: '#1e88e5',
            800: '#1565c0',
          },
        },
      },
    },
    plugins: [],
  }
  
