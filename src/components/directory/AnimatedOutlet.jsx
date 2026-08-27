import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Slide variants emulating native push (forward) / pop (back) transitions.
const variants = {
  enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 0 }),
};

// Tracks a lightweight pathname stack to infer navigation direction so the
// slide direction matches push (forward) vs pop (back).
function useNavigationDirection(pathname) {
  const [direction, setDirection] = useState(1);
  const stackRef = useRef([pathname]);

  useEffect(() => {
    const stack = stackRef.current;
    const idx = stack.indexOf(pathname);
    if (idx === -1) {
      stackRef.current = [...stack, pathname];
      setDirection(1); // new entry -> push forward
    } else if (idx < stack.length - 1) {
      stackRef.current = stack.slice(0, idx + 1);
      setDirection(-1); // existing entry revisited -> pop back
    }
  }, [pathname]);

  return direction;
}

export default function AnimatedOutlet({ className }) {
  const location = useLocation();
  const outlet = useOutlet();
  const direction = useNavigationDirection(location.pathname);

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className={cn('min-h-0', className)}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}