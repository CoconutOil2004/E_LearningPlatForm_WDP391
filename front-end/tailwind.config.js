/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      /* ── Fonts ── */
      fontFamily: {
        body:      ["Montserrat", "sans-serif"],
        heading:   ["Playfair Display", "serif"],
        bodyFont:  ["Montserrat", "sans-serif"],   // legacy alias
        titleFont: ["Playfair Display", "serif"],  // legacy alias
        sans:      ["Montserrat", "sans-serif"],
        serif:     ["Playfair Display", "serif"],
      },

      /* ── Colors — tất cả đều trỏ vào CSS variables ở index.css ──
         Chỉ cần sửa giá trị hex trong :root {} của index.css là xong */
      colors: {
        /* Brand */
        primary: {
          DEFAULT:    "var(--color-primary)",
          light:      "var(--color-primary-light)",
          dark:       "var(--color-primary-dark)",
          bg:         "var(--color-primary-bg)",
          foreground: "var(--color-primary-fg)",
        },
        secondary: {
          DEFAULT:    "var(--color-secondary)",
          light:      "var(--color-secondary-light)",
          dark:       "var(--color-secondary-dark)",
          bg:         "var(--color-secondary-bg)",
          foreground: "var(--color-secondary-fg)",
        },
        accent:  { DEFAULT: "var(--color-accent)"  },
        success: { DEFAULT: "var(--color-success)"  },
        danger:  { DEFAULT: "var(--color-danger)"   },
        warning: { DEFAULT: "var(--color-warning)"  },

        /* Backgrounds */
        page:    "var(--bg-page)",
        surface: "var(--bg-surface)",
        subtle:  "var(--bg-subtle)",

        /* Text */
        heading:  "var(--text-heading)",
        body:     "var(--text-body)",
        muted:    "var(--text-muted)",
        disabled: "var(--text-disabled)",

        /* Borders */
        border:  "var(--border-default)",

        /* Tailwind bridge — giữ cho shadcn/ui và legacy classes */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        input: "var(--input)",
        ring:  "var(--ring)",
        sidebar: {
          DEFAULT:            "var(--sidebar)",
          foreground:         "var(--sidebar-foreground)",
          primary:            "var(--sidebar-primary)",
          "primary-foreground":"var(--sidebar-primary-foreground)",
          accent:             "var(--sidebar-accent)",
          "accent-foreground":"var(--sidebar-accent-foreground)",
          border:             "var(--sidebar-border)",
          ring:               "var(--sidebar-ring)",
        },

        /* Legacy brand names từ fe gốc */
        cream:          "#fdfbf7",
        "forest-green": "#2D4F3E",
        "sage-green":   "#8BA889",
        charcoal:       "#1A1A1A",
        "soft-gold":    "#C5A059",
      },

      /* ── Border radius ── */
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        DEFAULT: "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        full: "var(--radius-full)",
      },

      /* ── Box shadows ── */
      boxShadow: {
        sm:      "var(--shadow-sm)",
        md:      "var(--shadow-md)",
        lg:      "var(--shadow-lg)",
        primary: "var(--shadow-primary)",
        "primary-hover": "var(--shadow-primary-hover)",
      },

      /* ── Background images (gradients) ── */
      backgroundImage: {
        "gradient-brand": "var(--gradient-brand)",
        "gradient-hero":  "var(--gradient-hero)",
        "gradient-cta":   "var(--gradient-cta)",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
