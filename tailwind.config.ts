import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f6f6f8',
        card: '#ffffff',
        'text-main': '#0f172a',
        'text-muted': '#64748b',
        'text-subtle': '#94a3b8',
        'border-light': '#e2e8f0',
        'border-subtle': '#cbd5e1',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Libre Baskerville', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Work Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        serif: '-0.111em',   // Libre Baskerville headings / brand / headwords (-111)
        sans: '-0.065em',    // Work Sans body / UI (-65)
        tightest: '-0.111em',
        tighter: '-0.065em',
        normal: '0em',
        wide: '0.08em',
      },
      boxShadow: {
        card: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
