/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "sans-serif"],
        angkor: ["Angkor"],
      },
      fontSize: {
        angkor: ["14px", "15.4px"],
        base: ["14px", "15.4px"],
      },
      colors: {
        "pb-yellow": "#FFC700",
        "pb-green": "#2FB163",
        "pb-orange": "#E17E22",
        "pb-silver": "#E2E4F4",
        "pb-gray-1": "#CCCCCC",
        "pb-beige-1": "#FEECC8",
        "pb-beige-2": "#CDC1A8",
      },
    },
  },
  plugins: [],
}
