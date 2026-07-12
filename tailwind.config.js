/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--c-app)',
        window: 'var(--c-window)',
        sidebar: 'var(--c-sidebar)',
        ink: 'var(--c-text)',
        muted: 'var(--c-muted)',
        faint: 'var(--c-faint)',
        field: 'var(--c-input)',
        active: 'var(--c-active)',
        line: 'var(--c-border)',
        bubble: 'var(--c-bubble-in)',
        bubbleink: 'var(--c-bubble-in-text)',
        chatbg: 'var(--c-chat-bg)',
        offline: 'var(--c-offline)',
        accent: 'var(--accent)',
        accent2: 'var(--accent-2)',
        accentdk: 'var(--accent-dk)',
        accentsoft: 'var(--accent-soft)',
        online: '#2ecc71',
        danger: '#e5484d',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pop: {
          '0%': { transform: 'scale(.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rise: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(46,204,113,.5)' },
          '70%': { boxShadow: '0 0 0 6px rgba(46,204,113,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(46,204,113,0)' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        pop: 'pop .45s ease',
        'pop-fast': 'pop .18s ease',
        rise: 'rise .32s ease',
        fade: 'fade .35s ease',
        'pulse-dot': 'pulse 2s infinite',
      },
      boxShadow: {
        window: '0 40px 90px -30px rgba(30,55,110,.4)',
        menu: '0 24px 50px -18px rgba(30,55,110,.4)',
      },
    },
  },
  plugins: [],
};

export default config;
