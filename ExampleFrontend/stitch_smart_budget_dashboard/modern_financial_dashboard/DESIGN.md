---
name: Modern Financial Dashboard
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e3'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fd'
  surface-container: '#ecedf7'
  surface-container-high: '#e6e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#424754'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#eff0fa'
  outline: '#727785'
  outline-variant: '#c2c6d6'
  surface-tint: '#005ac2'
  primary: '#0058be'
  on-primary: '#ffffff'
  primary-container: '#2170e4'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#924700'
  on-tertiary: '#ffffff'
  tertiary-container: '#b75b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#f9f9ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
typography:
  h1:
    fontFamily: manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  h2:
    fontFamily: manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h3:
    fontFamily: manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 2rem
  gutter: 1.5rem
  card-padding: 1.5rem
  stack-gap: 1rem
  base-unit: 4px
---

## Brand & Style
The design system is engineered for clarity, trust, and professional efficiency. It adopts a **Corporate / Modern** aesthetic that prioritizes data legibility and user confidence. The target audience includes financial analysts and business owners who require a high-density information environment that doesn't feel overwhelming. 

The visual language uses a combination of high-quality typography, a restrained color palette, and soft elevation to create a calm, organized workspace. By utilizing ample whitespace and organized data structures, the UI evokes a sense of reliability and precision.

## Colors
The color strategy for this design system revolves around a core professional blue, supported by a sophisticated neutral palette. 

- **Primary:** Use #3B82F6 for primary actions, active navigation states, and key data points in charts.
- **Background & Surface:** The application background uses a cool-toned light grey (#F8FAFC) to differentiate from the pure white (#FFFFFF) used for content cards and containers.
- **Accents:** Functional colors are reserved strictly for status communication. Use Success Green for positive trends and completed transactions, Danger Red for deficits or alerts, and Warning Amber for pending items or cautionary data.

## Typography
This design system utilizes a dual-font strategy to balance character with utility. **Manrope** is used for headlines and financial totals to provide a modern, refined geometric feel that commands attention. **Inter** is used for all body text and data labels due to its exceptional readability at small sizes and neutral, functional tone.

Use bold weights for numerical totals (Account Balances, Stat Card figures) to ensure they are the first thing a user sees. Status badges and table headers should utilize uppercase labels with slight letter-spacing for improved scannability.

## Layout & Spacing
The design system employs a **Fluid Grid** model with a 12-column system for the main content area. A fixed-width sidebar (280px) persists on the left, while the dashboard content expands to fill the viewport. 

The rhythm is based on a 4px baseline. Stat cards typically span 3 columns on desktop, while the primary line chart and data tables span 8 or 12 columns depending on information density. Use a consistent 24px (1.5rem) gutter between all major dashboard modules to maintain a clean, airy feel.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Ambient Shadows**. The interface uses two primary levels of elevation:
1.  **Level 0 (Floor):** The #F8FAFC background.
2.  **Level 1 (Cards):** White surfaces with a very soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) and a subtle 1px border (#E2E8F0) to ensure crispness against the background.

Modals and dropdown menus sit at **Level 2**, utilizing a more pronounced shadow (0px 10px 25px rgba(0, 0, 0, 0.1)) to indicate focus and separation from the dashboard floor.

## Shapes
The shape language is consistently **Rounded**. A 12px - 16px corner radius is applied to all primary containers and cards to soften the data-heavy environment. Smaller elements like buttons and input fields should utilize an 8px - 12px radius. Interactive status badges and chips should use a fully rounded (pill-shaped) style to distinguish them from structural elements.

## Components
- **Sidebar:** A vertical navigation bar with a light grey background or white surface. Use minimalist line icons paired with 14px Medium Inter text. Active states are indicated by the primary blue color and a subtle background tint.
- **Stat Cards:** Feature a large bold heading for the primary metric, a small descriptive label, and a miniature sparkline (line chart without axes) to show the 7-day trend.
- **Data Tables:** Clean rows with no vertical borders. Use 1px horizontal dividers. Status badges within tables should have a low-opacity background of the status color (e.g., light green tint) with high-contrast text.
- **Charts:** Donut charts should use a thick stroke with rounded ends. Line charts should include a subtle gradient fill underneath the primary blue line to add depth.
- **Buttons:** Primary buttons use a solid #3B82F6 fill with white text. Secondary buttons use a white fill with a 1px border and grey text.
- **Input Fields:** Utilize a light grey border that turns primary blue on focus, with a 12px corner radius.