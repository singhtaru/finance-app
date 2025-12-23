/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8075FF",
        secondary: "#E16F7C",
        dark: "#03012C",
        light: "#FFFBFA",
        danger: "#89023E",
      },
    },
  },
  plugins: [],
}
