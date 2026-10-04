/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#5B6CFF",
          purple: "#9B5CFF",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5B6CFF 0%, #9B5CFF 100%)",
      },
    },
  },
  plugins: [],
};
