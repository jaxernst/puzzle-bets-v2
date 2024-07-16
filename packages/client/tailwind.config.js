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
        base: ["14px", "14px"],
        "base-lead": ["14", "15.4"],
        md: ["13px", "13px"],
        sm: ["12px", "12px"],
        xs: ["11px", "11px"],
      },
      colors: {
        "pb-off-white": "#FEFAF0",
        "pb-yellow": "#FFC700",
        "pb-green": "#2FB163",
        "pb-orange": "#E17E22",
        "pb-silver": "#E2E4F4",
        "pb-gray-1": "#CCCCCC",
        "pb-beige-1": "#fff2d7",
        "pb-beige-2": "#CDC1A8",
        "pb-blue": "#97b5c2",
      },
    },
  },
  plugins: [],
}
