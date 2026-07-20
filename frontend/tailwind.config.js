module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cosmic: { 950: '#12093A', 900: '#180D50', 800: '#1E1468', 700: '#251C7A' },
        gold: { 300: '#F5D98D', 400: '#E8C547', 500: '#C9A84C', 600: '#A07832', 700: '#7A5A1E' },
        nebula: { purple: '#6B21A8', blue: '#1D4ED8', teal: '#0D9488' }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Noto Serif Devanagari', 'serif']
      },
      animation: {
        'spin-slow': 'spin 40s linear infinite',
        'spin-mandala': 'spin-cw 20s linear infinite',
        'spin-reverse': 'spin-reverse 60s linear infinite',
        'pulse-gold': 'pulse-gold 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
        'shooting-star': 'shooting-star 3s linear infinite',
        'blink-ai': 'blink-ai 1.4s ease-in-out infinite'
      },
      keyframes: {
        'spin-cw': { '0%': { transform: 'rotate(0deg) translateZ(0)' }, '100%': { transform: 'rotate(360deg) translateZ(0)' } },
        'spin-reverse': { '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } },
        'pulse-gold': {
          '0%, 100%': { textShadow: '0 0 20px #C9A84C, 0 0 40px #C9A84C' },
          '50%': { textShadow: '0 0 40px #C9A84C, 0 0 80px #E8C547, 0 0 120px #C9A84C' }
        },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        twinkle: { '0%': { opacity: 0.3, transform: 'scale(1)' }, '100%': { opacity: 1, transform: 'scale(1.2)' } },
        'shooting-star': {
          '0%': { transform: 'translateX(-100px) translateY(100px)', opacity: 1 },
          '100%': { transform: 'translateX(1000px) translateY(-1000px)', opacity: 0 }
        },
        'blink-ai': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 0 rgba(232,197,71,0)' },
          '50%': { opacity: 0.55, boxShadow: '0 0 18px rgba(232,197,71,0.65)' }
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at top, #1a1060 0%, #0A0E2A 40%, #04051A 100%)',
        'nebula-gradient': 'radial-gradient(ellipse at 70% 30%, rgba(107,33,168,0.3) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(29,78,216,0.2) 0%, transparent 60%)'
      }
    }
  },
  plugins: []
};
