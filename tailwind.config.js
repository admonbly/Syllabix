/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A237E',
          dark:    '#0D1540',
          mid:     '#1E2D8A',
          light:   '#2A3B9F',
          vivid:   '#2235CC',
        },
        accent: {
          DEFAULT: '#E85D04',
          dark:    '#C44E03',
          light:   '#FF8B3D',
          pale:    '#FFF0E0',
        },
        secondary: {
          DEFAULT: '#27AE60',
          dark:    '#1E8449',
          light:   '#2ECC71',
          pale:    '#E8F8EE',
        },
        dark:    '#0A0F2E',
        surface: {
          DEFAULT: '#F5F6FF',
          warm:    '#FFF8F0',
        },
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)',    'DM Sans',           'system-ui', 'sans-serif'],
        sans:    ['var(--font-body)',    'DM Sans',           'system-ui', 'sans-serif'],
        heading: ['var(--font-display)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem',     { lineHeight: '1.625rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.375rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl':['3rem',     { lineHeight: '1.1' }],
        '6xl':['3.75rem',  { lineHeight: '1.05' }],
        '7xl':['4.5rem',   { lineHeight: '1.02' }],
      },
      spacing: { section: '5rem', 18: '4.5rem' },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft:         '0 1px 3px rgba(26,35,126,0.06), 0 4px 12px rgba(26,35,126,0.06)',
        card:         '0 2px 8px rgba(26,35,126,0.07), 0 12px 28px rgba(26,35,126,0.09)',
        'card-hover': '0 8px 20px rgba(26,35,126,0.12), 0 24px 48px rgba(26,35,126,0.13)',
        accent:       '0 4px 20px rgba(232,93,4,0.35)',
        'accent-lg':  '0 8px 32px rgba(232,93,4,0.45)',
        primary:      '0 4px 20px rgba(26,35,126,0.35)',
        glow:         '0 0 40px rgba(232,93,4,0.25)',
        glass:        '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
      },
      animation: {
        float:        'float 5s ease-in-out infinite',
        'float-sm':   'float-sm 3s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'spin-slow':  'spin 1.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%':      { transform: 'translateY(-14px) rotate(0.5deg)' },
        },
        'float-sm': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
