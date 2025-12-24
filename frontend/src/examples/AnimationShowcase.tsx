/**
 * Animation Utilities Showcase
 * This file demonstrates all new animation components and hooks
 * Use as a reference for implementing animations in Bloghead
 */

import React from 'react';
import {
  FadeIn,
  StaggerContainerNew,
  StaggerItemNew,
  ScaleOnHover,
  SlideIn,
  Shimmer,
  GlowWrapper,
} from '@/components/ui';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function AnimationShowcase() {
  return (
    <div className="min-h-screen bg-bg-primary p-8 space-y-16">
      {/* FadeIn Examples */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-white">FadeIn Component</h2>

        <FadeIn delay={0.2} yOffset={20}>
          <div className="bg-bg-card p-6 rounded-xl">
            <h3 className="text-xl text-white">Fades in from below (yOffset=20)</h3>
          </div>
        </FadeIn>

        <FadeIn delay={0.4} xOffset={-50}>
          <div className="bg-bg-card p-6 rounded-xl">
            <h3 className="text-xl text-white">Fades in from left (xOffset=-50)</h3>
          </div>
        </FadeIn>
      </section>

      {/* StaggerContainer Examples */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-white">Stagger Animations</h2>

        <StaggerContainerNew staggerDelay={0.1} initialDelay={0.2}>
          {['First', 'Second', 'Third', 'Fourth'].map((item, i) => (
            <StaggerItemNew key={i} direction="up" distance={20}>
              <div className="bg-bg-card p-6 rounded-xl mb-4">
                <h3 className="text-xl text-white">{item} Item</h3>
              </div>
            </StaggerItemNew>
          ))}
        </StaggerContainerNew>
      </section>

      {/* ScaleOnHover Examples */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-white">Scale on Hover</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScaleOnHover scale={1.05}>
            <div className="bg-bg-card p-6 rounded-xl cursor-pointer">
              <h3 className="text-xl text-white">Hover me! (1.05x)</h3>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.1}>
            <div className="bg-bg-card p-6 rounded-xl cursor-pointer">
              <h3 className="text-xl text-white">Hover me! (1.1x)</h3>
            </div>
          </ScaleOnHover>

          <ScaleOnHover scale={1.03} duration={0.5}>
            <div className="bg-bg-card p-6 rounded-xl cursor-pointer">
              <h3 className="text-xl text-white">Slower hover (0.5s)</h3>
            </div>
          </ScaleOnHover>
        </div>
      </section>

      {/* SlideIn Examples */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-white">SlideIn Directions</h2>

        <div className="grid grid-cols-2 gap-4">
          <SlideIn direction="left" distance={100}>
            <div className="bg-bg-card p-6 rounded-xl">
              <h3 className="text-xl text-white">From Left</h3>
            </div>
          </SlideIn>

          <SlideIn direction="right" distance={100}>
            <div className="bg-bg-card p-6 rounded-xl">
              <h3 className="text-xl text-white">From Right</h3>
            </div>
          </SlideIn>

          <SlideIn direction="up" distance={100}>
            <div className="bg-bg-card p-6 rounded-xl">
              <h3 className="text-xl text-white">From Up</h3>
            </div>
          </SlideIn>

          <SlideIn direction="down" distance={100}>
            <div className="bg-bg-card p-6 rounded-xl">
              <h3 className="text-xl text-white">From Down</h3>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* Shimmer Loading Skeleton */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-white">Shimmer Loading Skeleton</h2>

        <div className="bg-bg-card p-6 rounded-xl space-y-4">
          <div className="flex items-center space-x-4">
            <Shimmer width="80px" height="80px" borderRadius="50%" />
            <div className="flex-1 space-y-2">
              <Shimmer width="200px" height="24px" delay={0.1} />
              <Shimmer width="150px" height="16px" delay={0.2} />
            </div>
          </div>

          <div className="space-y-2">
            <Shimmer height="100px" delay={0.3} />
            <Shimmer height="60px" delay={0.4} />
          </div>
        </div>
      </section>

      {/* GlowWrapper Examples */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-white">Glow Effects</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlowWrapper glowColor="rgba(97, 10, 209, 0.5)">
            <div className="bg-bg-card p-6 rounded-xl cursor-pointer">
              <h3 className="text-xl text-white">Purple Glow</h3>
            </div>
          </GlowWrapper>

          <GlowWrapper glowColor="rgba(251, 122, 67, 0.5)">
            <div className="bg-bg-card p-6 rounded-xl cursor-pointer">
              <h3 className="text-xl text-white">Orange Glow</h3>
            </div>
          </GlowWrapper>

          <GlowWrapper glowColor="rgba(249, 43, 2, 0.5)">
            <div className="bg-bg-card p-6 rounded-xl cursor-pointer">
              <h3 className="text-xl text-white">Red Glow</h3>
            </div>
          </GlowWrapper>
        </div>
      </section>

      {/* Combined Effects */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-white">Combined Effects</h2>

        <FadeIn delay={0.3} yOffset={30}>
          <GlowWrapper glowColor="rgba(97, 10, 209, 0.5)">
            <ScaleOnHover scale={1.05}>
              <div className="bg-bg-card p-8 rounded-xl cursor-pointer">
                <h3 className="text-2xl text-white mb-2">Triple Threat</h3>
                <p className="text-gray-400">FadeIn + Glow + Scale on Hover</p>
              </div>
            </ScaleOnHover>
          </GlowWrapper>
        </FadeIn>
      </section>

      {/* Scroll Hook Example */}
      <ScrollHookExample />
    </div>
  );
}

/**
 * Example component using useScrollAnimation hook
 */
function ScrollHookExample() {
  const { ref, isVisible, hasBeenVisible } = useScrollAnimation({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold text-white">useScrollAnimation Hook</h2>

      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`
          bg-bg-card p-8 rounded-xl transition-all duration-700
          ${isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-20'}
        `}
      >
        <h3 className="text-2xl text-white mb-2">
          {hasBeenVisible ? 'I appeared!' : 'Scroll down to see me appear'}
        </h3>
        <p className="text-gray-400">
          isVisible: {isVisible.toString()} | hasBeenVisible: {hasBeenVisible.toString()}
        </p>
      </div>
    </section>
  );
}

export default AnimationShowcase;
