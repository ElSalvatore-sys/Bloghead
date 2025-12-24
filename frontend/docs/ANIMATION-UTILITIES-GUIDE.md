# Bloghead Animation Utilities Guide

This guide covers all reusable animation components and utilities added to the Bloghead frontend.

## Table of Contents
- [Overview](#overview)
- [Animation Components](#animation-components)
- [Custom Hooks](#custom-hooks)
- [Animation Variants](#animation-variants)
- [Usage Examples](#usage-examples)

---

## Overview

The Bloghead animation system is built on Framer Motion and provides:

1. **Reusable Components** (`src/components/ui/animations.tsx`)
2. **Custom Hooks** (`src/hooks/useScrollAnimation.ts`)
3. **Animation Variants** (for advanced use cases)
4. **Existing Components** (AnimatedCard, AnimatedModal, ScrollReveal)

---

## Animation Components

### 1. FadeIn

Fade in with optional translation on x/y axis.

```tsx
import { FadeIn } from '@/components/ui';

<FadeIn delay={0.2} duration={0.5} yOffset={20}>
  <h1>This fades in from below</h1>
</FadeIn>

<FadeIn xOffset={-50}>
  <p>This fades in from the left</p>
</FadeIn>
```

**Props:**
- `delay` - Animation delay in seconds (default: 0)
- `duration` - Animation duration in seconds (default: 0.5)
- `yOffset` - Vertical offset in pixels (default: 0)
- `xOffset` - Horizontal offset in pixels (default: 0)
- `className` - Additional CSS classes

---

### 2. StaggerContainer & StaggerItem

For staggered list/grid animations.

```tsx
import { StaggerContainerNew, StaggerItemNew } from '@/components/ui';

<StaggerContainerNew staggerDelay={0.1} initialDelay={0.2}>
  {items.map((item, i) => (
    <StaggerItemNew key={i} direction="up" distance={20}>
      <div>{item.title}</div>
    </StaggerItemNew>
  ))}
</StaggerContainerNew>
```

**StaggerContainer Props:**
- `staggerDelay` - Delay between each item (default: 0.1)
- `initialDelay` - Delay before first item (default: 0)
- `viewport` - Intersection Observer options (default: `{ once: true, amount: 0.1 }`)

**StaggerItem Props:**
- `direction` - Animation direction: 'up', 'down', 'left', 'right', 'none' (default: 'up')
- `distance` - Animation distance in pixels (default: 20)

---

### 3. ScaleOnHover

Simple scale effect on hover.

```tsx
import { ScaleOnHover } from '@/components/ui';

<ScaleOnHover scale={1.05} duration={0.2}>
  <button>Hover me!</button>
</ScaleOnHover>
```

**Props:**
- `scale` - Scale factor on hover (default: 1.05)
- `duration` - Animation duration in seconds (default: 0.2)

---

### 4. SlideIn

Slide in from any direction.

```tsx
import { SlideIn } from '@/components/ui';

<SlideIn direction="left" distance={100} delay={0.3}>
  <div>Slides in from the left</div>
</SlideIn>

<SlideIn direction="right" distance={50}>
  <div>Slides in from the right</div>
</SlideIn>
```

**Props:**
- `direction` - Slide direction: 'left', 'right', 'up', 'down' (default: 'left')
- `distance` - Slide distance in pixels (default: 100)
- `delay` - Animation delay in seconds (default: 0)
- `duration` - Animation duration in seconds (default: 0.5)

---

### 5. Shimmer

Skeleton loading shimmer effect.

```tsx
import { Shimmer } from '@/components/ui';

<Shimmer width="100%" height="20px" borderRadius="4px" />
<Shimmer width="200px" height="40px" delay={0.1} />
```

**Props:**
- `width` - Width (default: '100%')
- `height` - Height (default: '20px')
- `borderRadius` - Border radius (default: '4px')
- `delay` - Animation delay in seconds (default: 0)

**Example - Loading Skeleton:**

```tsx
<div className="space-y-4">
  <Shimmer height="60px" borderRadius="8px" />
  <Shimmer height="200px" borderRadius="8px" delay={0.1} />
  <Shimmer height="100px" borderRadius="8px" delay={0.2} />
</div>
```

---

### 6. GlowWrapper

Glowing border/shadow effect on hover.

```tsx
import { GlowWrapper } from '@/components/ui';

<GlowWrapper glowColor="rgba(97, 10, 209, 0.5)" duration={0.3}>
  <div className="card">Hover for glow effect</div>
</GlowWrapper>
```

**Props:**
- `glowColor` - RGBA color for glow (default: 'rgba(97, 10, 209, 0.3)')
- `duration` - Animation duration in seconds (default: 0.3)

---

## Custom Hooks

### 1. useScrollAnimation

Trigger animations when element scrolls into view.

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

function MyComponent() {
  const { ref, isVisible, hasBeenVisible } = useScrollAnimation({
    threshold: 0.3,
    rootMargin: '0px',
    triggerOnce: true
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      Content animates on scroll
    </div>
  );
}
```

**Options:**
- `threshold` - Percentage of element visible to trigger (default: 0.1)
- `rootMargin` - Margin around viewport (default: '0px')
- `triggerOnce` - Only trigger once (default: true)

**Return Values:**
- `ref` - Attach to element to observe
- `isVisible` - Currently visible in viewport
- `hasBeenVisible` - Has been visible at least once

---

### 2. useMultiThresholdScroll

Progressive animations based on scroll depth.

```tsx
import { useMultiThresholdScroll } from '@/hooks/useScrollAnimation';

function ProgressiveAnimation() {
  const { ref, thresholdIndex } = useMultiThresholdScroll([0.25, 0.5, 0.75, 1.0]);

  const opacity = (thresholdIndex + 1) * 0.25;

  return (
    <div ref={ref} style={{ opacity }}>
      Fades in progressively as you scroll
    </div>
  );
}
```

---

### 3. useStaggeredScrollAnimation

Staggered animations for lists/grids.

```tsx
import { useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

function AnimatedList({ items }) {
  const animations = useStaggeredScrollAnimation(items.length, {
    threshold: 0.2,
    staggerDelay: 100
  });

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          ref={animations[i].ref}
          className={`transition-all duration-500 ${
            animations[i].isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}
```

**Options:**
- `itemCount` - Number of items
- `threshold` - Visibility threshold (default: 0.1)
- `staggerDelay` - Delay between items in ms (default: 100)
- `triggerOnce` - Only trigger once (default: true)

---

## Animation Variants

For advanced use cases with `motion` components:

```tsx
import { motion } from 'framer-motion';
import { fadeInUpVariants, scaleInVariants } from '@/components/ui';

<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={fadeInUpVariants}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

**Available Variants:**
- `fadeInVariants` - Simple fade in
- `fadeInUpVariants` - Fade in from below
- `scaleInVariants` - Fade in with scale
- `slideInLeftVariants` - Slide from left
- `slideInRightVariants` - Slide from right

---

## Usage Examples

### Example 1: Artist Card with Hover Effects

```tsx
import { ScaleOnHover, GlowWrapper } from '@/components/ui';

function ArtistCard({ artist }) {
  return (
    <GlowWrapper glowColor="rgba(251, 122, 67, 0.4)">
      <ScaleOnHover scale={1.03}>
        <div className="bg-bg-card rounded-xl p-6">
          <h3>{artist.name}</h3>
          <p>{artist.genre}</p>
        </div>
      </ScaleOnHover>
    </GlowWrapper>
  );
}
```

---

### Example 2: Scroll-Triggered Feature List

```tsx
import { StaggerContainerNew, StaggerItemNew } from '@/components/ui';

function FeaturesList({ features }) {
  return (
    <StaggerContainerNew staggerDelay={0.15} initialDelay={0.3}>
      {features.map((feature, i) => (
        <StaggerItemNew key={i} direction="up" distance={30}>
          <div className="feature-card">
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
          </div>
        </StaggerItemNew>
      ))}
    </StaggerContainerNew>
  );
}
```

---

### Example 3: Loading Skeleton

```tsx
import { Shimmer } from '@/components/ui';

function LoadingProfile() {
  return (
    <div className="space-y-4">
      {/* Avatar */}
      <Shimmer width="80px" height="80px" borderRadius="50%" />

      {/* Name */}
      <Shimmer width="200px" height="24px" delay={0.1} />

      {/* Bio lines */}
      <Shimmer width="100%" height="16px" delay={0.2} />
      <Shimmer width="90%" height="16px" delay={0.3} />
      <Shimmer width="95%" height="16px" delay={0.4} />
    </div>
  );
}
```

---

### Example 4: Advanced Scroll Animations

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

function ScrollSection() {
  const titleAnim = useScrollAnimation({ threshold: 0.5 });
  const contentAnim = useScrollAnimation({ threshold: 0.3 });

  return (
    <section>
      <motion.h2
        ref={titleAnim.ref}
        initial={{ opacity: 0, y: -20 }}
        animate={titleAnim.isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Section Title
      </motion.h2>

      <motion.div
        ref={contentAnim.ref}
        initial={{ opacity: 0, x: -50 }}
        animate={contentAnim.isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Section content...
      </motion.div>
    </section>
  );
}
```

---

### Example 5: Combining Multiple Effects

```tsx
import { FadeIn, GlowWrapper, ScaleOnHover } from '@/components/ui';

function HeroCard() {
  return (
    <FadeIn delay={0.2} yOffset={30}>
      <GlowWrapper glowColor="rgba(97, 10, 209, 0.5)">
        <ScaleOnHover scale={1.05}>
          <div className="hero-card">
            <h1>Amazing Feature</h1>
            <p>Hover to see the glow and scale effect</p>
          </div>
        </ScaleOnHover>
      </GlowWrapper>
    </FadeIn>
  );
}
```

---

## Best Practices

1. **Use `triggerOnce: true`** for scroll animations to improve performance
2. **Keep stagger delays short** (0.05-0.15s) for better UX
3. **Avoid animating too many elements** at once (use Shimmer for loading states)
4. **Test on slower devices** to ensure animations don't cause jank
5. **Use semantic HTML** inside animation wrappers (don't wrap everything in divs)
6. **Prefer CSS transitions** for simple hover effects over Framer Motion when possible

---

## Performance Tips

1. **Lazy load animations** in viewport using `useScrollAnimation`
2. **Use `viewport={{ once: true }}`** to prevent re-triggering
3. **Reduce motion** for users with `prefers-reduced-motion`:

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<FadeIn duration={prefersReducedMotion ? 0 : 0.5}>
  Content
</FadeIn>
```

---

## Migration from Existing Components

If you have existing scroll animations using `ScrollReveal`:

```tsx
// OLD
import { ScrollReveal } from '@/components/ui';
<ScrollReveal direction="up" delay={0.2}>Content</ScrollReveal>

// NEW (same functionality, but can use hooks for more control)
import { StaggerItemNew } from '@/components/ui';
<StaggerItemNew direction="up">Content</StaggerItemNew>

// OR with hook
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
const { ref, isVisible } = useScrollAnimation();
<div ref={ref} className={isVisible ? 'animate-in' : ''}>Content</div>
```

Both approaches work! Use components for simplicity, hooks for fine-grained control.

---

## Related Files

- **Components:** `/src/components/ui/animations.tsx`
- **Hooks:** `/src/hooks/useScrollAnimation.ts`
- **Variants Library:** `/src/lib/animations.ts`
- **Existing Components:**
  - `/src/components/ui/AnimatedCard.tsx`
  - `/src/components/ui/AnimatedModal.tsx`
  - `/src/components/ui/ScrollReveal.tsx`

---

**Last Updated:** December 24, 2024
