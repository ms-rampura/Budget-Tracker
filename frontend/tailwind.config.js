/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        "error-container": "#440002",
        "surface-bright": "#1a1c1e",
        "surface-container-highest": "#333538",
        "surface-dim": "#111315",
        "background": "#0f172a", /* Dark Navy */
        "inverse-primary": "#0058be",
        "on-surface-variant": "#c2c6d6",
        "surface-container": "#1e293b",
        "secondary-fixed": "#d3e4fe",
        "tertiary-fixed-dim": "#ffb786",
        "secondary-container": "#334155",
        "primary-fixed": "#d8e2ff",
        "on-secondary-container": "#e2e8f0",
        "on-error": "#ffffff",
        "on-tertiary": "#ffffff",
        "secondary-fixed-dim": "#b7c8e1",
        "tertiary-container": "#b75b00",
        "secondary": "#94a3b8",
        "surface-variant": "#424754",
        "on-secondary-fixed": "#0b1c30",
        "surface-container-high": "#1e293b",
        "primary-container": "#2170e4",
        "on-tertiary-fixed-variant": "#723600",
        "surface-container-lowest": "#020617",
        "on-secondary": "#ffffff",
        "inverse-on-surface": "#191b23",
        "inverse-surface": "#f9f9ff",
        "tertiary-fixed": "#ffdcc6",
        "on-secondary-fixed-variant": "#38485d",
        "tertiary": "#924700",
        "on-background": "#f1f5f9",
        "on-surface": "#f1f5f9",
        "on-primary": "#ffffff",
        "primary": "#3b82f6", /* Vibrant Blue */
        "primary-fixed-dim": "#adc6ff",
        "on-primary-fixed-variant": "#004395",
        "on-error-container": "#ffdad6",
        "on-primary-container": "#fefcff",
        "error": "#ffb4ab",
        "surface-container-low": "#0f172a",
        "surface": "#0f172a",
        "outline-variant": "#424754",
        "on-primary-fixed": "#001a42",
        "on-tertiary-fixed": "#311400",
        "outline": "#8e919f",
        "on-tertiary-container": "#fffbff",
        "surface-tint": "#3b82f6",
        // Keeping old ones just in case any component still uses them
        success: { light: '#10B981', dark: '#48b470' },
        danger:  { light: '#EF4444', dark: '#cc6464' }
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "stack-gap": "1rem",
        "base-unit": "4px",
        "container-margin": "2rem",
        "gutter": "1.5rem",
        "card-padding": "1.5rem"
      },
      fontFamily: {
        "body-lg": ["inter"],
        "h2": ["manrope"],
        "h1": ["manrope"],
        "h3": ["manrope"],
        "label-sm": ["inter"],
        "body-md": ["inter"]
      },
      fontSize: {
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "h2": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
        "h1": ["32px", {"lineHeight": "40px", "fontWeight": "700"}],
        "h3": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [],
};
