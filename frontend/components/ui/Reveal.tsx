'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Wrapper inayotumika mahali popote site nzima kutoa "scroll reveal"
// (content inajitokeza taratibu mtu anaposhuka page) -- badala ya kila
// section kutokea ghafla. Inatumia framer-motion (dependency iliyokuwepo
// tayari lakini haikuwa ikitumika kabisa kabla).
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
