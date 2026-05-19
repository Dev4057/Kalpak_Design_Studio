import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'admin-bg': '#F8F8F6',
        surface: '#FFFFFF',
        sidebar: '#1C1C1A',
        'sidebar-text': '#E8E6E1',
        'sidebar-active': '#B8955A',
        primary: {
          DEFAULT: '#B8955A',
          hover: '#9A7A45',
          foreground: '#FFFFFF',
        },
        text: {
          primary: '#1C1C1A',
          secondary: '#6B6966',
        },
        border: {
          DEFAULT: '#E5E3DF',
        },
        success: '#2D7D4F',
        warning: '#B45309',
        danger: '#B91C1C',
        info: '#1D4ED8',
        // Shadcn tokens
        background: '#F8F8F6',
        foreground: '#1C1C1A',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1C1A',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1C1A',
        },
        secondary: {
          DEFAULT: '#F1F0EE',
          foreground: '#1C1C1A',
        },
        muted: {
          DEFAULT: '#F1F0EE',
          foreground: '#6B6966',
        },
        accent: {
          DEFAULT: '#F1F0EE',
          foreground: '#1C1C1A',
        },
        destructive: {
          DEFAULT: '#B91C1C',
          foreground: '#FFFFFF',
        },
        input: '#E5E3DF',
        ring: '#B8955A',
        radius: '0.5rem',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
