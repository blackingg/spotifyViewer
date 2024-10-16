/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        expand: "expand 1.5s forwards ease-in-out",
      },
      keyframes: {
        expand: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(5)" },
        },
      },
    },
  },
  plugins: [],
};
