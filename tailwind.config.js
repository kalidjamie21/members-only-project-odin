/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./controllers/**/*.js",
    "./routes/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#20243a",
        cream: "#fffaf0",
        coral: "#ff6b5f",
        mint: "#c9f5df",
        lilac: "#e6ddff",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
