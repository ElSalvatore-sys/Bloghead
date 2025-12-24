import React from 'react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

// ============================================
// FadeIn Component - Fade in with optional y translation
// ============================================
interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  yOffset = 0,
  xOffset = 0,
  ...props
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Stagger Container & Item - For staggered list animations
// ============================================
interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  viewport?: {
    once?: boolean;
    amount?: number;
  };
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0,
  viewport = { once: true, amount: 0.1 },
  ...props
}) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={containerVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  direction = 'up',
  distance = 20,
  ...props
}) => {
  const directionOffsets = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, ...directionOffsets[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
};

// ============================================
// ScaleOnHover - Scale effect on hover
// ============================================
interface ScaleOnHoverProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export const ScaleOnHover: React.FC<ScaleOnHoverProps> = ({
  children,
  className = '',
  scale = 1.05,
  duration = 0.2,
  ...props
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{ duration, ease: 'easeInOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// SlideIn - Slide from direction (left/right/up/down)
// ============================================
interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  delay?: number;
  duration?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  className = '',
  direction = 'left',
  distance = 100,
  delay = 0,
  duration = 0.5,
  ...props
}) => {
  const directionOffsets = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionOffsets[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Shimmer - Skeleton loading shimmer effect
// ============================================
interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  delay?: number;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  className = '',
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  delay = 0,
}) => {
  return (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
        delay,
      }}
    />
  );
};

// ============================================
// GlowWrapper - Glowing hover effect
// ============================================
interface GlowWrapperProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  duration?: number;
}

export const GlowWrapper: React.FC<GlowWrapperProps> = ({
  children,
  className = '',
  glowColor = 'rgba(97, 10, 209, 0.3)',
  duration = 0.3,
  ...props
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        boxShadow: `0 0 30px ${glowColor}`,
      }}
      transition={{ duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Exported Animation Variants for Custom Use
// ============================================
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};
