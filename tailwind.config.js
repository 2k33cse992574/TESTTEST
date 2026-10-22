/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F7FB',
        surface: '#FFFFFF',
        'surface-subtle': '#F9FAFD',
        'text-primary': '#172033',
        'text-secondary': '#667085',
        'text-muted': '#8791A5',
        border: '#E6E9F0',
        brand: '#6558D3',
        'brand-hover': '#5144BD',
        'brand-soft': '#EFEDFF',
        info: '#2F6FED',
        success: '#198754',
        warning: '#B7791F',
        danger: '#C53B45',
        'neutral-status': '#667085',
        // Status colors
        'status-new': '#2F6FED',
        'status-review': '#2F6FED',
        'status-attention': '#B7791F',
        'status-discrepancy': '#B7791F',
        'status-critical': '#C53B45',
        'status-confirmed': '#198754',
        'status-closed': '#667085',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'section-title': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'metric': ['32px', { lineHeight: '1.1', fontWeight: '700' }],
      },
      borderRadius: {
        control: '10px',
        card: '16px',
        panel: '20px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(23,32,51,0.06), 0 1px 2px -1px rgba(23,32,51,0.04)',
        'card-hover': '0 4px 12px 0 rgba(23,32,51,0.10), 0 2px 4px -1px rgba(23,32,51,0.06)',
        dropdown: '0 8px 24px rgba(23,32,51,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.22s ease-out forwards',
        'slide-up': 'slideUp 0.22s cubic-bezier(0.16,1,0.3,1) forwards',
        'count-up': 'countUp 0.6s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.2,0,0,1)',
        'enter': 'cubic-bezier(0.16,1,0.3,1)',
        'exit': 'cubic-bezier(0.4,0,1,1)',
      },
      transitionDuration: {
        'fast': '160ms',
        'standard': '220ms',
        'emphasis': '300ms',
      },
    },
  },
  plugins: [],
}
