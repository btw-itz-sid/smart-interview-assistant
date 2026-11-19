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
        heading: ['Nunito', 'sans-serif'],
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
        brand: {
          50: '#f4f6fc',
          100: '#e7edf7',
          200: '#cbd9ee',
          300: '#9fbce1',
          400: '#6d97cf',
          500: '#487abf',
          600: '#345e9f',
          700: '#2a4b82',
          800: '#25416d',
          900: '#23375b',
          950: '#17233c',
        },
        dark: {
          900: '#0B0D13',
          800: '#12151E',
          700: '#1C212E',
          600: '#2A3042',
        }
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(72, 122, 191, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
