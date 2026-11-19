/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        // Bright gamified palette; each colour has a darker "edge" shade for 3D bottoms
        game: {
          purple: '#7C5CFC', 'purple-edge': '#5B3FD9', 'purple-soft': '#F1EDFF',
          green: '#58CC02', 'green-edge': '#46A302', 'green-soft': '#E9F9DC',
          orange: '#FF9600', 'orange-edge': '#D97F00', 'orange-soft': '#FFF2DE',
          yellow: '#FFC800', 'yellow-edge': '#E0A800', 'yellow-soft': '#FFF8D6',
          blue: '#1CB0F6', 'blue-edge': '#1593CF', 'blue-soft': '#DFF4FE',
          pink: '#FF4B91', 'pink-edge': '#D93A79', 'pink-soft': '#FFE4EF',
          red: '#FF4B4B', 'red-edge': '#D93636', 'red-soft': '#FFE5E5',
          ink: '#3C3C55', muted: '#7A7A95', line: '#E5E5F0', bg: '#F7F7FC',
        },
      },
    },
  },
  plugins: [],
}
