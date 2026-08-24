---
name: CampusSwap
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  heading-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  heading-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for a high-density, fast-paced academic environment. It balances the rigor of engineering with the vibrancy of campus life, targeting a demographic that values efficiency, technical aesthetics, and reliability.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**. It utilizes a clean, systematic structure that evokes trust, while employing frosted glass overlays and vibrant gradients to maintain a youthful, "tech-first" energy. The interface prioritizes high information density without sacrificing legibility, ensuring students can navigate the marketplace during brief gaps between lectures.

## Colors

The palette is anchored by a deep **Dark Navy** for text and structural elements, providing a grounded, professional foundation. **Electric Blue** and **Purple** are utilized as primary accents to denote interactivity and "pro" features.

For critical campus features, such as the emergency SOS or high-priority alerts, a high-visibility **Red/Orange** spectrum is used. Surfaces primarily utilize **White** and **Light Gray** to maintain a spacious feel. When using currency, the ₹ (INR) symbol should inherit the color of the adjacent numerical value, typically the primary text color unless discounted (Danger) or highlighted (Primary).

## Typography

This design system relies exclusively on **Inter** to deliver a utilitarian yet modern feel. The hierarchy is characterized by significant contrast between bold, heavy headings and compact, highly legible metadata.

- **Display & Headings:** Use tight letter spacing and heavy weights to create a sense of urgency and importance.
- **Body:** Standardized for long-form reading of product descriptions or technical specs.
- **Labels:** Utilized for tags, categories, and small metadata (e.g., "Year of Purchase"), often in uppercase with slight tracking to improve readability at small sizes.

## Layout & Spacing

The system is built on a strict **8px grid**. All margins, paddings, and component dimensions must be multiples of 8 to ensure mathematical harmony and vertical rhythm.

- **Mobile:** 4-column fluid grid with 16px side margins.
- **Tablet:** 8-column fluid grid with 24px side margins.
- **Desktop:** 12-column fixed grid (max-width 1280px) centered in the viewport.

Horizontal spacing between elements in a row should typically use the `gutter` (16px), while vertical sections should be separated by `xl` (32px) to provide clear visual breathing room between marketplace categories.

## Elevation & Depth

Hierarchy is established through a combination of tonal layering and soft shadows. 

- **Low Elevation:** Used for standard product cards. A very subtle 1px border (#E2E8F0) paired with a diffused shadow to lift the card slightly from the background.
- **Medium Elevation:** Used for active states, dropdowns, and hover effects. The shadow becomes deeper and more spread.
- **High Elevation (Overlays):** Used for modals and "SOS" alerts. These utilize **Glassmorphism**: a backdrop blur (12px to 20px) and a semi-transparent white fill (opacity 70-80%) to maintain context of the background while focusing the user's attention.

## Shapes

The shape language is friendly but structured. Rounded corners are used extensively to soften the "industrial" feel of an engineering marketplace.

- **Large Radius (24px):** Reserved for primary container cards (e.g., item listings).
- **Medium Radius (16px):** Standard for buttons and input fields.
- **Small Radius (8px):** Used for nested elements like chips, tags, and small image thumbnails.

## Components

### Buttons
- **Primary:** Solid Electric Blue or Purple with white text. High-contrast, rounded (16px).
- **Emergency SOS:** Bright Red background, bold white text, often accompanied by a pulse animation.

### Cards
Marketplace cards must feature a 24px corner radius. The image should be top-aligned with the top corners clipped to match the card radius. Pricing (in ₹) should be positioned in the bottom-left in `heading-lg` weight.

### Chips
Used for "Condition" (e.g., New, Used-Good) and "Category." These are small (8px radius) with a subtle light-gray background and `label-md` typography.

### Input Fields
Fields use a 16px radius with a light-gray (#F1F5F9) fill. On focus, the border transitions to Electric Blue with a subtle outer glow.

### Information Overlays
Utilize the high-elevation Glassmorphism style. Ensure a 1px white "inner shine" border to simulate a glass edge, enhancing the premium feel.