/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        gold: 'var(--gold)',
        charcoal: 'var(--charcoal)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
        sans: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: '0px',
        md: '0px',
        sm: '0px',
        DEFAULT: '0px',
      },
      boxShadow: {
        gold: '0 0 20px oklch(0.75 0.15 85 / 0.3)',
        'gold-sm': '0 0 8px oklch(0.75 0.15 85 / 0.2)',
      },
      animation: {
        'bond-rotate': 'bond-rotate 4s linear infinite',
        'bond-pulse': 'bond-pulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
