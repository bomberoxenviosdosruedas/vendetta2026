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
      padding: "2rem",
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
        sans: ['Tahoma', 'Arial', 'Helvetica', 'sans-serif'],
        tahoma: ['Tahoma', 'Arial', 'Helvetica', 'sans-serif'],
        heading: ['var(--font-bebas-neue)', 'Tahoma', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'tactical': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px hsl(var(--border) / 0.6)',
        'tactical-elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.75), 0 0 0 1px hsl(var(--border))',
        'glow-crimson': '0 0 15px -3px rgba(220, 38, 38, 0.35)',
        'glow-gold': '0 0 15px -3px rgba(234, 179, 8, 0.35)',
      },
      colors: {
        vendetta: {
          burgundy: '#6C0000',
          pink: '#ffcccc',
          yellow: '#fff400',
          gold: '#ffe569',
          orange: '#ee7000',
          dark: '#111111',
          black: '#020202',
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
          lowest: 'hsl(var(--surface-lowest, 240 10% 4.5%))',
          card: 'hsl(var(--surface-card, 240 8% 8.5%))',
          elevated: 'hsl(var(--surface-elevated, 240 7% 12%))',
          overlay: 'hsl(var(--surface-overlay, 240 7% 15%))',
        },
        resource: {
          armas: 'hsl(var(--resource-armas, 0 72% 51%))',
          municion: 'hsl(var(--resource-municion, 38 92% 50%))',
          alcohol: 'hsl(var(--resource-alcohol, 35 90% 44%))',
          dolares: 'hsl(var(--resource-dolares, 160 84% 39%))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
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
          '0%, 100%': { boxShadow: '0 0 15px rgba(220, 38, 38, 0.35)' },
          '50%': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.15)' },
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
