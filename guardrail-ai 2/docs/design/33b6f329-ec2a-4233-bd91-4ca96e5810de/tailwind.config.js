const token = (name) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        card: token('card'),
        muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        border: token('border'),
        track: token('track'),
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
          ink: token('primary-ink'),
        },
        accent: { DEFAULT: token('accent'), fg: token('accent-fg') },
        allowed: { DEFAULT: token('allowed'), fg: token('allowed-fg') },
        approval: { DEFAULT: token('approval'), fg: token('approval-fg') },
        blocked: { DEFAULT: token('blocked'), fg: token('blocked-fg') },
        danger: token('danger'),
        pending: token('pending'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
      },
      boxShadow: {
        soft: '0 1px 2px hsl(222 30% 12% / 0.04), 0 4px 16px -6px hsl(222 30% 12% / 0.06)',
        lift: '0 12px 40px -12px hsl(222 30% 12% / 0.25)',
      },
    },
  },
  plugins: [],
};
