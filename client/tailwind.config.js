/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* === New Google Sheets Palette === */
        // Primary surfaces
        'sheet-bg': '#f0f1f3',
        'sheet-white': '#fafbfc',
        'sheet-cell': '#ffffff',
        'sheet-hover': 'rgba(0, 184, 148, 0.06)',
        'sheet-selected': 'rgba(0, 184, 148, 0.12)',

        // Borders
        'sheet-border': '#dfe6e9',
        'sheet-border-dark': '#b2bec3',

        // Text
        'slate-primary': '#1e272e',
        'slate-secondary': '#2d3436',
        'slate-muted': '#636e72',
        'slate-light': '#b2bec3',

        // Header & toolbar
        'header-bg': '#1e272e',
        'toolbar-bg': '#ffffff',

        // Accent colors
        'accent-teal': '#00b894',
        'accent-teal-dark': '#00a381',
        'accent-blue': '#0984e3',
        'accent-blue-light': '#74b9ff',

        // Status
        'status-done': '#00b894',
        'status-progress': '#0984e3',
        'status-lag': '#d63031',

        // Category colors (updated for light theme)
        'cat-education': '#0984e3',
        'cat-fitness': '#00b894',
        'cat-project': '#6c5ce7',
        'cat-work': '#fdcb6e',

        // Rainbow week stripes
        'week-1': '#ff6b6b',
        'week-2': '#ffa502',
        'week-3': '#ffd43b',
        'week-4': '#51cf66',
        'week-5': '#339af0',
        'week-6': '#845ef7',

        // Legacy (kept for transition, used in analyzer)
        'mamba-black': '#1e272e',
        'mamba-dark': '#2d3436',
        'mamba-border': '#dfe6e9',
        'cyber-blue': '#0984e3',
        'neon-purple': '#6c5ce7',
        'neon-green': '#00b894',
        'neon-red': '#d63031',
        'mamba-gold': '#fdcb6e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sheet': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'sheet-lg': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'sheet-hover': '0 2px 8px rgba(0,0,0,0.1)',
        'toolbar': '0 2px 4px rgba(0,0,0,0.06)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-1': 'wave 1.2s ease-in-out infinite',
        'wave-2': 'wave 1.2s ease-in-out 0.1s infinite',
        'wave-3': 'wave 1.2s ease-in-out 0.2s infinite',
        'wave-4': 'wave 1.2s ease-in-out 0.3s infinite',
        'wave-5': 'wave 1.2s ease-in-out 0.4s infinite',
        'wave-6': 'wave 1.2s ease-in-out 0.5s infinite',
        'wave-7': 'wave 1.2s ease-in-out 0.6s infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'row-enter': 'rowEnter 0.3s ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rowEnter: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
