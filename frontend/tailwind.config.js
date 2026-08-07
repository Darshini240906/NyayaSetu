function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined && !Number.isNaN(Number(opacityValue))) {
      return `color-mix(in srgb, var(${variableName}) ${Number(opacityValue) * 100}%, transparent)`;
    }
    return `var(${variableName})`;
  };
}

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: withOpacity('--color-base'),
        "base-deep": withOpacity('--color-base-deep'),
        surface: withOpacity('--color-surface'),
        "surface-hover": withOpacity('--color-surface-hover'),
        border: withOpacity('--color-border'),
        cream: withOpacity('--color-cream'),
        "rose-muted": withOpacity('--color-rose-muted'),
        gold: withOpacity('--color-gold'),
        "gold-dark": withOpacity('--color-gold-dark'),
        "gold-light": withOpacity('--color-gold-light'),
        success: withOpacity('--color-success'),
        danger: withOpacity('--color-danger'),
        warn: withOpacity('--color-warn'),
        sage: withOpacity('--color-sage'),

        // Additive only — your friend's extra names, backed by new variables
        // that default to match your existing palette. Nothing currently in
        // the app uses these, so nothing breaks; they're just available now.
        primary: { DEFAULT: withOpacity('--color-primary'), foreground: withOpacity('--color-primary-foreground') },
        secondary: { DEFAULT: withOpacity('--color-secondary'), foreground: withOpacity('--color-secondary-foreground') },
        muted: { DEFAULT: withOpacity('--color-muted'), foreground: withOpacity('--color-muted-foreground') },
        accent: { DEFAULT: withOpacity('--color-accent'), foreground: withOpacity('--color-accent-foreground') },
        destructive: { DEFAULT: withOpacity('--color-destructive'), foreground: withOpacity('--color-destructive-foreground') },
        sidebar: {
          DEFAULT: withOpacity('--color-sidebar'),
          foreground: withOpacity('--color-sidebar-foreground'),
          border: withOpacity('--color-sidebar-border'),
          active: withOpacity('--color-sidebar-active'),
          "active-foreground": withOpacity('--color-sidebar-active-foreground'),
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        fadeInUp: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        blink: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0 } },
      },
    },
  },
  plugins: [],
};