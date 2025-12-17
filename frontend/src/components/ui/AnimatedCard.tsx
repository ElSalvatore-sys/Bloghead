import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  disableHover?: boolean;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
}

const hoverEffects = {
  lift: {
    y: -5,
    boxShadow: '0 20px 40px rgba(97, 10, 209, 0.15)',
    transition: { duration: 0.3 },
  },
  glow: {
    boxShadow: '0 0 30px rgba(97, 10, 209, 0.3)',
    transition: { duration: 0.3 },
  },
  scale: {
    scale: 1.02,
    transition: { duration: 0.3 },
  },
  none: {},
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  disableHover = false,
  hoverEffect = 'lift',
  ...props
}) => {
  return (
    <motion.div
      className={`bg-bg-card rounded-xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={disableHover ? undefined : hoverEffects[hoverEffect]}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
