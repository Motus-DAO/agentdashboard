import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#9333EA',
          pink: '#EC4899',
          blue: '#6366F1',
          cyan: '#00E5FF',
          magenta: '#E144FF',
        },
        surface: 'rgba(255,255,255,0.06)',
        'surface-hover': 'rgba(255,255,255,0.10)',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
        heading: ['var(--font-heading)', 'Jura', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-display)', 'Orbitron', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      backdropBlur: {
        glass: '20px',
        'glass-strong': '32px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.08)',
        glow: '0 0 20px rgba(147, 51, 234, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.3)',
        soft: '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
