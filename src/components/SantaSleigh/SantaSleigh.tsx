import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SantaSleighProps {
  isFlying: boolean;
  partyLights: boolean;
}

export const SantaSleigh: React.FC<SantaSleighProps> = ({ isFlying, partyLights }) => {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-14 sm:top-16 z-20 h-28 overflow-hidden">
      <AnimatePresence>
        {isFlying && (
          <motion.div
            initial={{ x: '-25vw', y: 24, opacity: 0 }}
            animate={{
              x: '115vw',
              y: [24, 4, 18, 2],
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6.2, ease: 'easeInOut' }}
            className="flex items-center gap-1"
          >
            {/* Rastro mágico */}
            <div
              className={`h-1.5 w-28 sm:w-44 rounded-full blur-[2px] ${
                partyLights
                  ? 'bg-gradient-to-r from-transparent via-pink-400 to-amber-300'
                  : 'bg-gradient-to-r from-transparent via-amber-200/70 to-amber-300'
              }`}
            />
            {/* Ilustração SVG original do trenó e renas */}
            <svg
              viewBox="0 0 240 70"
              className="w-44 sm:w-64 h-auto drop-shadow-[0_0_12px_rgba(251,191,36,0.75)]"
            >
              {/* Trenó */}
              <path
                d="M15 48 Q35 55 75 48 L82 32 L58 32 L52 40 L25 40 L20 26 L12 26 Z"
                fill="#dc2626"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <path d="M10 53 Q45 58 86 51" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Papai Noel */}
              <circle cx="42" cy="24" r="7" fill="#fde68a" />
              <path d="M35 22 Q42 10 49 22 Z" fill="#dc2626" />
              <circle cx="49" cy="18" r="2.2" fill="#ffffff" />
              {/* Rédeas */}
              <path d="M78 36 Q135 42 205 34" stroke="#fde68a" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
              {/* Rena 1 */}
              <g transform="translate(125, 22)">
                <ellipse cx="14" cy="16" rx="11" ry="6" fill="#92400e" />
                <circle cx="24" cy="9" r="4.5" fill="#92400e" />
                <path d="M23 5 L21 0 M25 5 L28 0" stroke="#fde68a" strokeWidth="1.5" />
                <line x1="8" y1="21" x2="5" y2="30" stroke="#78350f" strokeWidth="2" />
                <line x1="20" y1="21" x2="24" y2="30" stroke="#78350f" strokeWidth="2" />
              </g>
              {/* Rena 2 (Rudolph) */}
              <g transform="translate(180, 18)">
                <ellipse cx="14" cy="16" rx="11" ry="6" fill="#b45309" />
                <circle cx="24" cy="9" r="4.5" fill="#b45309" />
                <circle cx="29" cy="9" r="2.3" fill="#ef4444" />
                <path d="M23 5 L21 0 M25 5 L28 0" stroke="#fde68a" strokeWidth="1.5" />
                <line x1="8" y1="21" x2="4" y2="30" stroke="#78350f" strokeWidth="2" />
                <line x1="20" y1="21" x2="25" y2="30" stroke="#78350f" strokeWidth="2" />
              </g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
