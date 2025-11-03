module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"]
      },
      colors: {
        glass: {
          50: "#f8fafc"
        }
      }
    }
  },
  plugins: []
}
