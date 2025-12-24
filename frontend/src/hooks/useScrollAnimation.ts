import { useEffect, useState, useRef, type RefObject } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface ScrollAnimationResult {
  ref: RefObject<HTMLElement | null>;
  isVisible: boolean;
  hasBeenVisible: boolean;
}

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 *
 * @param options - Configuration options for the intersection observer
 * @returns Object containing ref to attach to element, current visibility state, and historical visibility
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={`transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollAnimation(
  options: ScrollAnimationOptions = {}
): ScrollAnimationResult {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show the element
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;

          if (visible) {
            setIsVisible(true);
            setHasBeenVisible(true);

            // If triggerOnce is true, disconnect after first trigger
            if (triggerOnce) {
              observer.disconnect();
            }
          } else {
            // Only update visibility if not using triggerOnce
            if (!triggerOnce) {
              setIsVisible(false);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible, hasBeenVisible };
}

/**
 * Hook variant for multiple thresholds (progressive animation stages)
 *
 * @param thresholds - Array of threshold values (0-1)
 * @returns Object containing ref and current threshold index
 *
 * @example
 * ```tsx
 * function ProgressiveAnimation() {
 *   const { ref, thresholdIndex } = useMultiThresholdScroll([0.25, 0.5, 0.75, 1.0]);
 *
 *   return (
 *     <div ref={ref} style={{ opacity: thresholdIndex * 0.25 }}>
 *       Progressive fade-in content
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultiThresholdScroll(thresholds: number[] = [0.25, 0.5, 0.75, 1.0]) {
  const ref = useRef<HTMLElement>(null);
  const [thresholdIndex, setThresholdIndex] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setThresholdIndex(thresholds.length - 1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = thresholds.findIndex((t) => t >= entry.intersectionRatio);
            if (index !== -1) {
              setThresholdIndex(index);
            }
          }
        });
      },
      {
        threshold: thresholds,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [thresholds]);

  return { ref, thresholdIndex };
}

/**
 * Hook for staggered scroll animations (for lists/grids)
 *
 * @param itemCount - Number of items to animate
 * @param options - Scroll animation options
 * @returns Array of refs and visibility states for each item
 *
 * @example
 * ```tsx
 * function AnimatedList({ items }) {
 *   const animations = useStaggeredScrollAnimation(items.length, {
 *     threshold: 0.2,
 *     staggerDelay: 100
 *   });
 *
 *   return (
 *     <div>
 *       {items.map((item, i) => (
 *         <div
 *           key={i}
 *           ref={animations[i].ref}
 *           className={animations[i].isVisible ? 'animate-in' : 'opacity-0'}
 *         >
 *           {item}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStaggeredScrollAnimation(
  itemCount: number,
  options: ScrollAnimationOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...scrollOptions } = options;
  const refs = useRef<(HTMLElement | null)[]>(Array(itemCount).fill(null));
  const [visibleStates, setVisibleStates] = useState<boolean[]>(
    Array(itemCount).fill(false)
  );

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisibleStates(Array(itemCount).fill(true));
      return;
    }

    const observers: IntersectionObserver[] = [];

    refs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Add stagger delay
              setTimeout(() => {
                setVisibleStates((prev) => {
                  const newStates = [...prev];
                  newStates[index] = true;
                  return newStates;
                });

                if (scrollOptions.triggerOnce !== false) {
                  observer.disconnect();
                }
              }, index * staggerDelay);
            }
          });
        },
        {
          threshold: scrollOptions.threshold || 0.1,
          rootMargin: scrollOptions.rootMargin || '0px',
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [itemCount, staggerDelay, scrollOptions]);

  return refs.current.map((_, index) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    isVisible: visibleStates[index],
  }));
}

export default useScrollAnimation;
