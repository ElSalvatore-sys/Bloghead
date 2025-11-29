# Bloghead Design Specifications

Complete UI/UX specifications extracted from design files.

---

## 1. Color System

### Primary Palette

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| Background | `#171717` | `23, 23, 23` | `--bg-primary` | Main page background |
| Card Background | `#232323` | `35, 35, 35` | `--bg-card` | Card backgrounds |
| Card Hover | `#2a2a2a` | `42, 42, 42` | `--bg-card-hover` | Card hover state |
| Purple | `#610AD1` | `97, 10, 209` | `--accent-purple` | Primary accent, gradient start |
| Red | `#F92B02` | `249, 43, 2` | `--accent-red` | CTA buttons, gradient middle |
| Orange/Salmon | `#FB7A43` | `251, 122, 67` | `--accent-salmon` | Gradient end |
| Blue | `#190AD1` | `25, 10, 209` | `--accent-blue` | Secondary accent, background accent |

### Text Colors

| Name | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Primary | `#FFFFFF` | `--text-primary` | Headlines, important text |
| Secondary | `rgba(255, 255, 255, 0.8)` | `--text-secondary` | Body text |
| Muted | `rgba(255, 255, 255, 0.6)` | `--text-muted` | Labels, placeholders |
| Disabled | `rgba(255, 255, 255, 0.4)` | `--text-disabled` | Disabled states |

### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Success | Green | `#22C55E` | Confirmed, available |
| Warning | Orange | `#FB7A43` | Pending, attention needed |
| Error | Red | `#F92B02` | Cancelled, error |
| Info | Blue | `#190AD1` | Information |

### CSS Variables

```css
:root {
  /* Backgrounds */
  --bg-primary: #171717;
  --bg-card: #232323;
  --bg-card-hover: #2a2a2a;
  --bg-overlay: rgba(0, 0, 0, 0.8);

  /* Accents */
  --accent-purple: #610AD1;
  --accent-red: #F92B02;
  --accent-salmon: #FB7A43;
  --accent-blue: #190AD1;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-muted: rgba(255, 255, 255, 0.6);
  --text-disabled: rgba(255, 255, 255, 0.4);

  /* Borders */
  --border-light: rgba(255, 255, 255, 0.1);
  --border-medium: rgba(255, 255, 255, 0.2);
  --border-focus: var(--accent-purple);
}
```

---

## 2. Gradients

### Primary Gradient (Bloghead Signature)

```css
/* Linear gradient for buttons, accents */
.gradient-primary {
  background: linear-gradient(90deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%);
}

/* 135° diagonal for special elements */
.gradient-diagonal {
  background: linear-gradient(135deg, #610AD1 0%, #F92B02 50%, #FB7A43 100%);
}

/* Button gradient (horizontal) */
.gradient-button {
  background: linear-gradient(90deg, #610AD1 0%, #F92B02 100%);
}

/* Sign-in button specific */
.gradient-signin {
  background: linear-gradient(90deg, #F92B02 0%, #FB7A43 100%);
}
```

### Brush Stroke Effect

```css
/* Used for decorative dividers */
.brush-stroke {
  background: linear-gradient(90deg, #610AD1 0%, #F92B02 60%, #FB7A43 100%);
  height: 4px;
  mask-image: url('/brush-stroke.svg');
  mask-size: 100% 100%;
}
```

### Modal Header Gradient

```css
.modal-gradient {
  background: linear-gradient(180deg, #610AD1 0%, transparent 100%);
}
```

---

## 3. Typography

### Font Families

| Font | Usage | Fallbacks |
|------|-------|-----------|
| Hyperwave One | Display titles, section headers | `cursive` |
| Roboto | All other text | `system-ui, sans-serif` |

### Font Loading

```css
/* Hyperwave One - Display Font */
@font-face {
  font-family: 'Hyperwave One';
  src: url('/fonts/HyperwaveOne.woff2') format('woff2'),
       url('/fonts/HyperwaveOne.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Roboto - UI Font */
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: 'Roboto';
  src: url('/fonts/Roboto-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
}
```

### Type Scale

| Element | Font | Weight | Size | Line Height | Letter Spacing | Transform |
|---------|------|--------|------|-------------|----------------|-----------|
| Display XL | Hyperwave One | 400 | 120px | 1.0 | 0 | none |
| Display L | Hyperwave One | 400 | 72px | 1.1 | 0 | none |
| Display M | Hyperwave One | 400 | 48px | 1.2 | 0 | none |
| Display S | Hyperwave One | 400 | 36px | 1.2 | 0 | none |
| H1 | Roboto | 700 | 32px | 1.3 | 0.5px | uppercase |
| H2 | Roboto | 700 | 24px | 1.3 | 0.5px | uppercase |
| H3 | Roboto | 700 | 20px | 1.4 | 0 | none |
| H4 | Roboto | 700 | 18px | 1.4 | 0 | none |
| Body L | Roboto | 400 | 18px | 1.6 | 0 | none |
| Body | Roboto | 400 | 16px | 1.6 | 0 | none |
| Body S | Roboto | 400 | 14px | 1.5 | 0 | none |
| Caption | Roboto | 400 | 12px | 1.4 | 0.5px | uppercase |
| Label | Roboto | 700 | 14px | 1.4 | 1px | uppercase |
| Button | Roboto | 700 | 14px | 1.0 | 1px | uppercase |

### CSS Typography Classes

```css
/* Display fonts */
.font-display { font-family: 'Hyperwave One', cursive; }
.font-sans { font-family: 'Roboto', system-ui, sans-serif; }

/* Sizes */
.text-display-xl { font-size: 120px; line-height: 1.0; }
.text-display-l { font-size: 72px; line-height: 1.1; }
.text-display-m { font-size: 48px; line-height: 1.2; }
.text-display-s { font-size: 36px; line-height: 1.2; }

/* Section titles (like "ABOUT", "ARTISTS") */
.section-title {
  font-family: 'Hyperwave One', cursive;
  font-size: 48px;
  color: var(--text-primary);
}

/* Uppercase labels */
.text-label {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

---

## 4. Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-1` | 4px | Tight spacing |
| `spacing-2` | 8px | Small elements |
| `spacing-3` | 12px | Default gaps |
| `spacing-4` | 16px | Component padding |
| `spacing-5` | 20px | Medium gaps |
| `spacing-6` | 24px | Card padding |
| `spacing-8` | 32px | Section gaps |
| `spacing-10` | 40px | Large gaps |
| `spacing-12` | 48px | Section padding |
| `spacing-16` | 64px | Page sections |
| `spacing-20` | 80px | Major sections |
| `spacing-24` | 96px | Hero sections |

### Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button | 12px 32px | - |
| Input | 12px 20px | - |
| Card | 24px | - |
| Modal | 40px | - |
| Section | 80px 0 | - |
| Card Grid | - | 24px |
| Filter Bar | - | 16px |
| Form Fields | - | 16px |

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-none` | 0 | Square elements |
| `rounded-sm` | 4px | Subtle rounding |
| `rounded-md` | 8px | Cards, inputs |
| `rounded-lg` | 12px | Larger cards |
| `rounded-xl` | 16px | Modal corners |
| `rounded-2xl` | 20px | Hero cards |
| `rounded-full` | 9999px | Buttons, pills, avatars |

### Component Radius

| Component | Radius |
|-----------|--------|
| Button | `rounded-full` (25px) |
| Input | `rounded-full` (25px) |
| Card | `rounded-md` (8px) |
| Modal | `rounded-xl` (20px) |
| Avatar | `rounded-full` |
| Badge | `rounded-full` |
| Filter Dropdown | `rounded-full` (25px) |
| Image | `rounded-none` (0) |

---

## 6. Shadows

```css
/* Elevation system */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);

/* Glow effects for accents */
--glow-purple: 0 0 20px rgba(97, 10, 209, 0.4);
--glow-red: 0 0 20px rgba(249, 43, 2, 0.4);
```

---

## 7. Components

### 7.1 Buttons

#### Primary Button

```css
.btn-primary {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  min-width: 120px;

  /* Appearance */
  background: linear-gradient(90deg, #610AD1 0%, #F92B02 100%);
  border: none;
  border-radius: 25px;

  /* Typography */
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #FFFFFF;

  /* Interaction */
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Secondary Button

```css
.btn-secondary {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;

  /* Appearance */
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;

  /* Typography */
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #FFFFFF;

  /* Interaction */
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}
```

#### Sign-In Button (Special)

```css
.btn-signin {
  background: linear-gradient(90deg, #F92B02 0%, #FB7A43 100%);
  padding: 8px 24px;
  border-radius: 25px;
  font-size: 12px;
  /* Plus decorative brush stroke underneath */
}
```

#### Button Sizes

| Size | Padding | Font Size | Min Width |
|------|---------|-----------|-----------|
| Small | 8px 20px | 12px | 80px |
| Medium | 12px 32px | 14px | 120px |
| Large | 16px 40px | 16px | 160px |

### 7.2 Input Fields

```css
.input-field {
  /* Layout */
  width: 100%;
  padding: 12px 20px;

  /* Appearance */
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;

  /* Typography */
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #FFFFFF;

  /* Interaction */
  transition: border-color 0.2s;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-purple);
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* With label */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
}
```

### 7.3 Artist Card

```css
.artist-card {
  /* Layout */
  width: 280px;
  display: flex;
  flex-direction: column;
}

.artist-card__image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.artist-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-card__favorite {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.artist-card__favorite--active {
  fill: var(--accent-purple);
}

.artist-card__content {
  padding: 16px 0;
}

.artist-card__name {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #FFFFFF;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.artist-card__role {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.artist-card__location {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.artist-card__price {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.artist-card__rating {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.artist-card__rating-star {
  width: 16px;
  height: 16px;
}

.artist-card__rating-star--filled {
  fill: #FFFFFF;
}

.artist-card__rating-star--empty {
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.5);
}

.artist-card__button {
  width: 100%;
}
```

### 7.4 Modal

```css
.modal-overlay {
  /* Positioning */
  position: fixed;
  inset: 0;
  z-index: 50;

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Appearance */
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.modal-content {
  /* Layout */
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 16px;
  padding: 40px;

  /* Appearance */
  background: linear-gradient(180deg, var(--accent-purple) 0%, var(--bg-card) 30%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #FFFFFF;
}

.modal-title {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: #FFFFFF;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 24px;
}
```

### 7.5 Filter Bar

```css
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-dropdown {
  /* Layout */
  padding: 12px 24px;
  min-width: 150px;

  /* Appearance */
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;

  /* Typography */
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  /* Interaction */
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-dropdown:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.filter-dropdown--active {
  border-color: var(--accent-purple);
  background: rgba(97, 10, 209, 0.1);
}

.filter-expand-btn {
  /* Uses gradient-primary styles */
  padding: 12px 24px;
}
```

### 7.6 Star Rating

```css
.star-rating {
  display: flex;
  gap: 4px;
}

.star-rating__star {
  width: 20px;
  height: 20px;
}

.star-rating__star--filled {
  fill: #FFFFFF;
}

.star-rating__star--empty {
  fill: transparent;
  stroke: rgba(255, 255, 255, 0.4);
  stroke-width: 1.5px;
}

/* Interactive rating */
.star-rating--interactive .star-rating__star {
  cursor: pointer;
  transition: transform 0.1s;
}

.star-rating--interactive .star-rating__star:hover {
  transform: scale(1.1);
}
```

### 7.7 Calendar

```css
.calendar {
  background: transparent;
}

.calendar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar__month {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #FFFFFF;
}

.calendar__nav {
  display: flex;
  gap: 8px;
}

.calendar__nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #FFFFFF;
  cursor: pointer;
}

.calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.calendar__weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar__day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.calendar__day:hover {
  background: rgba(255, 255, 255, 0.1);
}

.calendar__day--today {
  border: 1px solid var(--accent-purple);
}

.calendar__day--available {
  background: var(--accent-purple);
}

.calendar__day--booked {
  background: rgba(255, 255, 255, 0.1);
  position: relative;
}

.calendar__day--booked::after {
  content: '';
  /* Microphone icon indicator */
}

.calendar__day--pending {
  background: rgba(128, 128, 128, 0.3);
}

.calendar__day--selected {
  background: var(--accent-red);
}

.calendar__day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

---

## 8. Layout Patterns

### 8.1 Header

```css
.header {
  /* Positioning */
  position: sticky;
  top: 0;
  z-index: 40;

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;

  /* Appearance */
  background: var(--bg-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header__logo {
  height: 32px;
}

.header__nav {
  display: flex;
  gap: 32px;
}

.header__nav-link {
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}

.header__nav-link:hover,
.header__nav-link--active {
  color: #FFFFFF;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__social {
  display: flex;
  gap: 12px;
}

.header__social-icon {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
}

.header__social-icon:hover {
  color: #FFFFFF;
}
```

### 8.2 Footer

```css
.footer {
  padding: 40px 24px;
  text-align: center;
}

.footer__divider {
  /* Gradient brush stroke */
  width: 200px;
  height: 4px;
  margin: 0 auto 32px;
}

.footer__links {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.footer__link {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.2s;
}

.footer__link:hover {
  color: #FFFFFF;
}
```

### 8.3 Page Hero

```css
.page-hero {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.page-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
}

.page-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 100%);
}

.page-hero__content {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.page-hero__title {
  font-family: 'Hyperwave One', cursive;
  font-size: 72px;
  color: #FFFFFF;
}
```

### 8.4 Section Layout

```css
.section {
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.section__header {
  text-align: center;
  margin-bottom: 48px;
}

.section__title {
  font-family: 'Hyperwave One', cursive;
  font-size: 48px;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.section__divider {
  width: 120px;
  height: 4px;
  margin: 0 auto;
  /* Gradient brush */
}
```

### 8.5 Grid Layouts

```css
/* Artist card grid */
.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .artist-grid {
    grid-template-columns: 1fr;
  }
}

/* Profile info grid */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Instagram grid */
.instagram-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
```

---

## 9. Animation & Transitions

### Transition Defaults

```css
/* Standard transition */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;

/* Common transitions */
.transition-colors {
  transition: color var(--transition-normal),
              background-color var(--transition-normal),
              border-color var(--transition-normal);
}

.transition-opacity {
  transition: opacity var(--transition-normal);
}

.transition-transform {
  transition: transform var(--transition-normal);
}

.transition-all {
  transition: all var(--transition-normal);
}
```

### Hover Effects

```css
/* Lift effect */
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Scale effect */
.hover-scale:hover {
  transform: scale(1.02);
}

/* Glow effect */
.hover-glow:hover {
  box-shadow: var(--glow-purple);
}
```

### Modal Animation

```css
.modal-enter {
  opacity: 0;
  transform: scale(0.95);
}

.modal-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity 200ms, transform 200ms;
}

.modal-exit {
  opacity: 1;
  transform: scale(1);
}

.modal-exit-active {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 200ms, transform 200ms;
}
```

---

## 10. Responsive Breakpoints

| Breakpoint | Value | Target |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Responsive Typography

```css
/* Mobile-first responsive sizes */
.section-title {
  font-size: 36px;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 48px;
  }
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 72px;
  }
}
```

### Container Widths

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding: 0 24px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}
```

---

## 11. Icons

### Icon Sizes

| Size | Value | Usage |
|------|-------|-------|
| `xs` | 16px | Inline icons |
| `sm` | 20px | Button icons |
| `md` | 24px | Standard |
| `lg` | 32px | Featured |
| `xl` | 48px | Section icons |

### Icon Colors

```css
.icon {
  fill: currentColor;
  color: inherit;
}

.icon--muted {
  color: rgba(255, 255, 255, 0.6);
}

.icon--accent {
  color: var(--accent-purple);
}
```

---

## 12. Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Default |
| Dropdown | 10 | Dropdown menus |
| Sticky | 20 | Sticky elements |
| Fixed | 30 | Fixed elements |
| Header | 40 | Navigation header |
| Modal Backdrop | 50 | Modal overlay |
| Modal | 60 | Modal content |
| Toast | 70 | Notifications |
| Tooltip | 80 | Tooltips |
| Maximum | 100 | Critical overlays |

---

*Specification Version: 1.0*
*Last Updated: November 2024*
*Based on: BlogHead_Styleguide.pdf, BlogHead-Website-Ansicht.pdf*
