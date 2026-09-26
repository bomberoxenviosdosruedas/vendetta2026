import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
        '17': 'repeat(17, minmax(0, 1fr))',
      },
      fontFamily: {
        sans: ['var(--font-work-sans)', 'Arimo', 'Tahoma', 'Arial', 'Helvetica', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'Chivo', 'Tahoma', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        tahoma: ['Tahoma', 'Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        // Mechanical depth only — no soft ambient rings, no border halos.
        'base': '0 3px 8px rgba(0, 0, 0, 0.8)',
        'tactical': '0 6px 16px rgba(0, 0, 0, 0.75)',
        'tactical-elevated': '0 12px 32px rgba(0, 0, 0, 0.85)',
        'inset-stamp': 'inset 0 2px 4px rgba(0, 0, 0, 0.45)',
        'inset-well': 'inset 0 1px 3px rgba(0, 0, 0, 0.9)',
        'glow-crimson': '0 0 15px -3px rgba(160, 32, 32, 0.4)',
        'glow-gold': '0 0 15px -3px rgba(255, 229, 105, 0.3)',
      },
      colors: {
        vendetta: {
          burgundy: '#6d1414',
          pink: '#ffdad6',
          yellow: '#ffe569',
          gold: '#ffe569',
          orange: '#ee7000',
          dark: '#1f1813',
          black: '#0a0806',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        surface: {
          lowest: '#130d08',
          card: '#1f1813',
          elevated: '#302823',
          overlay: '#3c332d',
        },
        resource: {
          armas: '#a02020',
          municion: '#dfcca0',
          alcohol: '#ee7000',
          dolares: '#5fe06e',
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        base: 'var(--radius-base)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'glow-crimson': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(160, 32, 32, 0.4)' },
          '50%': { boxShadow: '0 0 5px rgba(160, 32, 32, 0.15)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'fade-in-up': 'fade-in-up 0.3s ease-in-out',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'glow-crimson': 'glow-crimson 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config;
