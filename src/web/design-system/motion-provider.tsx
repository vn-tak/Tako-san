import React from 'react';
import { MotionConfig } from 'motion/react';

/** Keep the reduced-motion policy available without importing animation primitives. */
export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);
