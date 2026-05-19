/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        // NexFlow design tokens
        brand: {
          50: 'hsl(230, 100%, 97%)',
          100: 'hsl(230, 95%, 92%)',
          200: 'hsl(230, 90%, 82%)',
          300: 'hsl(230, 85%, 68%)',
          400: 'hsl(230, 80%, 56%)',
          500: 'hsl(230, 75%, 46%)',   // primary
          600: 'hsl(230, 75%, 38%)',
          700: 'hsl(230, 75%, 30%)',
          800: 'hsl(230, 75%, 22%)',
          900: 'hsl(230, 75%, 15%)',
          950: 'hsl(230, 80%, 8%)',
        },
        surface: {
          DEFAULT: 'hsl(222, 20%, 12%)',
          elevated: 'hsl(222, 20%, 16%)',
          overlay: 'hsl(222, 20%, 20%)',
          border: 'hsl(222, 20%, 24%)',
        },
        status: {
          new: 'hsl(220, 70%, 60%)',
          approved: 'hsl(270, 70%, 60%)',   // purple
          committed: 'hsl(195, 70%, 50%)',   // cyan
          done: 'hsl(145, 60%, 45%)',         // green
          removed: 'hsl(0, 0%, 45%)',         // gray
        },
        type: {
          epic: 'hsl(270, 70%, 60%)',    // purple
          story: 'hsl(210, 70%, 55%)',   // blue
          task: 'hsl(145, 60%, 45%)',    // green
          bug: 'hsl(0, 70%, 55%)',       // red
        },
        sla: {
          safe: 'hsl(145, 60%, 45%)',
          warning: 'hsl(38, 90%, 50%)',
          danger: 'hsl(0, 70%, 55%)',
          breached: 'hsl(0, 70%, 35%)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        'brand-gradient': 'linear-gradient(135deg, hsl(230,75%,46%), hsl(270,70%,55%))',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-over': 'slideOver 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-sla': 'pulseSla 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideOver: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        pulseSla: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
};
