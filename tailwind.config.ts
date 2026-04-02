import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Notebook Design System Colors
        notebook: {
          paper: '#fdfbf6',
          'paper-dark': '#faf8f3',
          'paper-light': '#fffdfa',
          ink: '#000000',
          'ink-secondary': '#2d3436',
          'ink-light': '#636e72',
          green: '#7dc280',
          yellow: '#fff08a',
          red: '#ff7b7b',
          blue: '#96c3e0',
          pink: '#ff9aa2',
          purple: '#c8b6f6',
        },
        // Slate Scale
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        // Notebook Shadows
        'notebook-sm': '3px 3px 0 rgba(0, 0, 0, 0.08)',
        'notebook-md': '4px 4px 0 rgba(0, 0, 0, 0.12)',
        'notebook-lg': '6px 6px 0 rgba(0, 0, 0, 0.15)',
        'notebook-xl': '8px 8px 0 rgba(0, 0, 0, 0.18)',
        'notebook-2xl': '10px 10px 0 rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Roboto"',
          '"Oxygen"',
          '"Ubuntu"',
          '"Cantarell"',
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          'sans-serif',
          '"Geist"',
          '"Geist Fallback"',
        ],
        mono: [
          '"Fira Code"',
          '"Courier New"',
          'monospace',
          '"Geist Mono"',
          '"Geist Mono Fallback"',
        ],
      },
      transitionDuration: {
        150: '150ms',
        250: '250ms',
        350: '350ms',
      },
    },
  },
  plugins: [],
}

export default config
