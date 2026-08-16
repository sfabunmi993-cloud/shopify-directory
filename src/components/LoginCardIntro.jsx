import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* A chibi-style boy in a pulling lunge — reaches toward the card to drag it */
function DraggingBoy() {
  return (
    <motion.svg
      viewBox="0 0 120 150"
      className="w-full h-auto drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]"
      initial={{ rotate: -4 }}
      animate={{ rotate: [-4, -1.5, -4] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* legs in a lunge */}
      <g>
        <path d="M45 120 L38 150 L48 150 L55 122 Z" fill="#2b3a55" />
        <path d="M58 118 L72 146 L82 143 L66 116 Z" fill="#2b3a55" />
        <ellipse cx="43" cy="150" rx="8" ry="4" fill="#1f2937" />
        <ellipse cx="77" cy="145" rx="8" ry="4" fill="#1f2937" />
      </g>
      {/* torso */}
      <path d="M40 70 Q40 60 60 60 Q80 60 80 70 L78 120 Q60 128 42 120 Z" fill="#3b82f6" />
      {/* back arm */}
      <path d="M42 76 Q30 92 34 106 L42 104 Q40 92 48 84 Z" fill="#f4c89a" />
      {/* pulling arm reaching right (toward the card) */}
      <motion.g
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M78 74 Q106 70 114 92 L106 96 Q98 82 78 84 Z" fill="#f4c89a" />
        <circle cx="113" cy="94" r="7" fill="#f4c89a" />
      </motion.g>
      {/* head */}
      <circle cx="60" cy="40" r="20" fill="#f4c89a" />
      {/* hair */}
      <path d="M40 34 Q44 16 60 16 Q78 16 80 34 Q74 26 60 26 Q48 26 40 34 Z" fill="#3a2a1a" />
      {/* effort eyes */}
      <circle cx="53" cy="40" r="2.2" fill="#1f2937" />
      <circle cx="67" cy="40" r="2.2" fill="#1f2937" />
      <path d="M54 49 Q60 45 66 49" stroke="#1f2937" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="50" cy="47" r="2.5" fill="#f7a8a8" opacity="0.6" />
      <circle cx="70" cy="47" r="2.5" fill="#f7a8a8" opacity="0.6" />
    </motion.svg>
  );
}

/* The same boy, now sitting cross-legged on top of the card, breathing idly */
function SittingBoy() {
  return (
    <motion.svg
      viewBox="0 0 100 120"
      className="w-full h-auto drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]"
    >
      {/* crossed legs */}
      <path d="M20 88 Q50 76 80 88 Q80 102 50 102 Q20 102 20 88 Z" fill="#2b3a55" />
      <path d="M26 92 Q50 84 74 92 L74 97 Q50 90 26 97 Z" fill="#1f2937" opacity="0.25" />
      {/* breathing torso + arms */}
      <motion.g
        animate={{ scaleY: [1, 1.05, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 82px" }}
      >
        <path d="M34 44 Q34 36 50 36 Q66 36 66 44 L64 84 Q50 90 36 84 Z" fill="#3b82f6" />
        {/* arms resting on knees */}
        <path d="M34 50 Q22 64 30 80 L40 78 Q34 66 42 56 Z" fill="#f4c89a" />
        <path d="M66 50 Q78 64 70 80 L60 78 Q66 66 58 56 Z" fill="#f4c89a" />
        <circle cx="30" cy="80" r="5" fill="#f4c89a" />
        <circle cx="70" cy="80" r="5" fill="#f4c89a" />
      </motion.g>
      {/* head */}
      <circle cx="50" cy="26" r="18" fill="#f4c89a" />
      {/* hair */}
      <path d="M32 22 Q36 6 50 6 Q66 6 68 22 Q62 14 50 14 Q40 14 32 22 Z" fill="#3a2a1a" />
      {/* content eyes */}
      <circle cx="43" cy="26" r="2" fill="#1f2937" />
      <circle cx="57" cy="26" r="2" fill="#1f2937" />
      <path d="M44 34 Q50 38 56 34" stroke="#1f2937" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="31" r="2.4" fill="#f7a8a8" opacity="0.6" />
      <circle cx="60" cy="31" r="2.4" fill="#f7a8a8" opacity="0.6" />
    </motion.svg>
  );
}

export default function LoginCardIntro({ children }) {
  const [rested, setRested] = useState(false);

  return (
    <div className="relative w-full flex flex-col items-center">
      <motion.div
        className="relative w-full max-w-[440px]"
        initial={{ x: "-125%", rotate: -5, opacity: 0 }}
        animate={{ x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        onAnimationComplete={() => setRested(true)}
      >
        {/* boy dragging the card in from the left */}
        <AnimatePresence>
          {!rested && (
            <motion.div
              className="absolute -left-20 sm:-left-24 bottom-12 w-20 sm:w-24 pointer-events-none z-20"
              exit={{ opacity: 0, y: -26, scale: 0.6 }}
              transition={{ duration: 0.35 }}
            >
              <DraggingBoy />
            </motion.div>
          )}
        </AnimatePresence>

        {children}

        {/* boy hops up and rests on top of the card */}
        <AnimatePresence>
          {rested && (
            <motion.div
              className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 w-16 sm:w-20 pointer-events-none z-20"
              initial={{ opacity: 0, y: -36, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 13 }}
            >
              <SittingBoy />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}