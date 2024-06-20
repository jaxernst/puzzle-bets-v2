/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        "pb-yellow": "#FFC702",
        "pb-gray-1": "#F2EDE0",
        "pb-gray-2": "#C0BCB4",
        "pb-off-white": "#FFFAF0",
      },
    },
  },
  plugins: [],
}
