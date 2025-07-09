/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#FF00FF',
          blue: '#00FFFF',
          purple: '#9D00FF',
          green: '#00FF7F',
          yellow: '#FFFF00'
        },
        dark: {
          900: '#0A0A16',
          800: '#121228',
          700: '#1E1E3F'
        },
        web3: {
          primary: '#8A4FFF',
          secondary: '#27AE60',
          accent: '#F2C94C'
        }
      },
      fontFamily: {
        cyber: ['Rajdhani', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite'
      },
      keyframes: {
        glow: {
          '0%': { 'text-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #00FFFF, 0 0 20px #00FFFF' },
          '100%': { 'text-shadow': '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #FF00FF, 0 0 40px #FF00FF' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      boxShadow: {
        'glow-neon-blue-soft': '0 0 4px rgba(0, 255, 255, 0.4)',
        'glow-neon-pink-soft': '0 0 4px rgba(255, 0, 255, 0.4)',
        'glow-neon-purple-soft': '0 0 4px rgba(157, 0, 255, 0.4)',
        'glow-neon-green-soft': '0 0 4px rgba(0, 255, 127, 0.4)',
        'glow-neon-blue': '0 0 8px rgba(0, 255, 255, 0.7), 0 0 12px rgba(0, 255, 255, 0.5)',
        'glow-neon-pink': '0 0 8px rgba(255, 0, 255, 0.7), 0 0 12px rgba(255, 0, 255, 0.5)',
        'glow-neon-purple': '0 0 8px rgba(157, 0, 255, 0.7), 0 0 12px rgba(157, 0, 255, 0.5)',
        'glow-neon-green': '0 0 8px rgba(0, 255, 127, 0.7), 0 0 12px rgba(0, 255, 127, 0.5)',
        'neumorphic-light': '9px 9px 16px #d1d9e6, -9px -9px 16px #ffffff',
        'neumorphic-light-inset': 'inset 9px 9px 16px #d1d9e6, inset -9px -9px 16px #ffffff',
        'neumorphic-light-button': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
        'neumorphic-light-xl': '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',

        'neumorphic-dark': '9px 9px 16px rgba(0,0,0,0.4), -9px -9px 16px rgba(255,255,255,0.05)',
        'neumorphic-dark-inset': 'inset 9px 9px 16px rgba(0,0,0,0.4), inset -9px -9px 16px rgba(255,255,255,0.05)',
        'neumorphic-dark-button': '5px 5px 10px rgba(0,0,0,0.4), -5px -5px 10px rgba(255,255,255,0.05)',
        'neumorphic-dark-xl': '20px 20px 60px rgba(0,0,0,0.4), -20px -20px 60px rgba(255,255,255,0.05)',
      }
    }
  },
  plugins: [],
} 