import React from 'react';
import { motion } from 'motion/react';

export const LegacyNavIndicator: React.FC<{ indicatorId: string }> = ({ indicatorId }) => (
  <motion.span
    layoutId={indicatorId}
    aria-hidden="true"
    className="absolute inset-0 rounded-card bg-semantic-success-soft"
    transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
  />
);
