import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        white: 'var(--white)',
        charcoal: 'var(--charcoal)',
        mid: 'var(--mid)',
        border: 'var(--border)',
        sage: 'var(--sage)',
        'sage-light': 'var(--sage-light)',
        'sage-pale': 'var(--sage-pale)',
        sky: 'var(--sky)',
        'sky-light': 'var(--sky-light)',
        'sky-pale': 'var(--sky-pale)',
        gold: 'var(--gold)',
        'gold-dark': 'var(--gold-dark)',
        'gold-pale': 'var(--gold-pale)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      screens: {
        xs: '390px',
      },
    },
  },
  plugins: [],
};

export default config;
