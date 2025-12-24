# Animation Utilities - Quick Reference Card

## Import Statement

```tsx
import {
  // Components
  FadeIn,
  StaggerContainerNew,
  StaggerItemNew,
  ScaleOnHover,
  SlideIn,
  Shimmer,
  GlowWrapper,

  // Variants (advanced)
  fadeInVariants,
  fadeInUpVariants,
  scaleInVariants,
  slideInLeftVariants,
  slideInRightVariants,
} from '@/components/ui';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
```

---

## Quick Examples

### FadeIn
```tsx
<FadeIn delay={0.2} yOffset={20}>Content</FadeIn>
```

### SlideIn
```tsx
<SlideIn direction="left" distance={100}>Content</SlideIn>
```

### ScaleOnHover
```tsx
<ScaleOnHover scale={1.05}>Content</ScaleOnHover>
```

### GlowWrapper
```tsx
<GlowWrapper glowColor="rgba(97, 10, 209, 0.5)">Content</GlowWrapper>
```

### Shimmer (Loading)
```tsx
<Shimmer width="100%" height="20px" />
```

### Stagger List
```tsx
<StaggerContainerNew staggerDelay={0.1}>
  {items.map((item, i) => (
    <StaggerItemNew key={i} direction="up">
      {item}
    </StaggerItemNew>
  ))}
</StaggerContainerNew>
```

### Scroll Hook
```tsx
const { ref, isVisible } = useScrollAnimation({ threshold: 0.5 });

<div ref={ref} className={isVisible ? 'show' : 'hide'}>
  Content
</div>
```

---

## Props Cheat Sheet

| Component | Key Props | Defaults |
|-----------|-----------|----------|
| **FadeIn** | `delay`, `duration`, `yOffset`, `xOffset` | 0, 0.5, 0, 0 |
| **SlideIn** | `direction`, `distance`, `delay`, `duration` | 'left', 100, 0, 0.5 |
| **ScaleOnHover** | `scale`, `duration` | 1.05, 0.2 |
| **GlowWrapper** | `glowColor`, `duration` | purple, 0.3 |
| **Shimmer** | `width`, `height`, `borderRadius`, `delay` | '100%', '20px', '4px', 0 |
| **StaggerContainer** | `staggerDelay`, `initialDelay` | 0.1, 0 |
| **StaggerItem** | `direction`, `distance` | 'up', 20 |

---

## Common Patterns

### Hero Section
```tsx
<FadeIn delay={0.2} yOffset={30}>
  <h1>Hero Title</h1>
</FadeIn>
```

### Feature Cards Grid
```tsx
<StaggerContainerNew staggerDelay={0.1}>
  {features.map((f, i) => (
    <StaggerItemNew key={i}>
      <ScaleOnHover>
        <Card>{f.title}</Card>
      </ScaleOnHover>
    </StaggerItemNew>
  ))}
</StaggerContainerNew>
```

### Loading Skeleton
```tsx
<div className="space-y-4">
  <Shimmer height="60px" />
  <Shimmer height="200px" delay={0.1} />
  <Shimmer height="100px" delay={0.2} />
</div>
```

### Combined Effects
```tsx
<FadeIn delay={0.3}>
  <GlowWrapper glowColor="rgba(97, 10, 209, 0.5)">
    <ScaleOnHover scale={1.05}>
      <Card>Content</Card>
    </ScaleOnHover>
  </GlowWrapper>
</FadeIn>
```

---

## Direction Options

**SlideIn & StaggerItem:**
- `left` - Slide from left
- `right` - Slide from right
- `up` - Slide from bottom
- `down` - Slide from top

---

## Color Presets (for GlowWrapper)

```tsx
// Bloghead Brand Colors
glowColor="rgba(97, 10, 209, 0.5)"   // Purple
glowColor="rgba(251, 122, 67, 0.5)"  // Orange
glowColor="rgba(249, 43, 2, 0.5)"    // Red
```

---

## Scroll Hook Options

```tsx
useScrollAnimation({
  threshold: 0.1,      // 0-1, % of element visible
  rootMargin: '0px',   // Viewport margin
  triggerOnce: true,   // Only trigger once
})
```

---

**Full Documentation:** `/docs/ANIMATION-UTILITIES-GUIDE.md`
**Example Showcase:** `/src/examples/AnimationShowcase.tsx`
