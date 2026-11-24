import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { soundEngine } from '../../features/audio/soundEngine';

interface SnowmanProps {
  sfxEnabled: boolean;
  reducedMotion: boolean;
}

export const Snowman: React.FC<SnowmanProps> = ({ sfxEnabled, reducedMotion }) => {
  const { t } = useTranslation();
  const [buildStage, setBuildStage] = useState<number>(reducedMotion ? 3 : 0);
  const [clicks, setClicks] = useState<number>(0);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [snowballSplash, setSnowballSplash] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (reducedMotion) {
      setBuildStage(3);
      return;
    }
    const t1 = window.setTimeout(() => setBuildStage(1), 650);
    const t2 = window.setTimeout(() => setBuildStage(2), 1400);
    const t3 = window.setTimeout(() => setBuildStage(3), 2150);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [reducedMotion]);

  const handleInteract = () => {
    if (buildStage < 3) return;
    const nextClick = clicks + 1;

    if (nextClick === 1) {
      setClicks(1);
      setBubbleText(t('snowman.click1'));
      soundEngine.playSfx('chime', sfxEnabled);
    } else if (nextClick === 2) {
      setClicks(2);
      setBubbleText(t('snowman.click2'));
      soundEngine.playSfx('chime', sfxEnabled);
    } else {
      setClicks(3);
      setBubbleText(t('snowman.click3'));
      setSnowballSplash(true);
      soundEngine.playSfx('snowball', sfxEnabled);

      window.setTimeout(() => {
        setSnowballSplash(false);
      }, 1450);

      window.setTimeout(() => {
        setClicks(0);
        setBubbleText(t('snowman.recovering'));
        window.setTimeout(() => setBubbleText(null), 2200);
      }, 2800);
    }
  };

  const isAngry = clicks >= 3;

  return (
    <>
      <AnimatePresence>
        {snowballSplash && (
          <motion.div
            initial={{ scale: 0.15, opacity: 0.15, rotate: -15 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.35 }}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/95 blur-[2px] shadow-[0_0_95px_rgba(255,255,255,0.98)] flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-sky-100/90 border-4 border-white/80" />
              <span className="absolute -top-3 left-10 w-8 h-8 rounded-full bg-white shadow" />
              <span className="absolute top-8 -right-3 w-10 h-10 rounded-full bg-white shadow" />
              <span className="absolute -bottom-2 right-12 w-7 h-7 rounded-full bg-white shadow" />
              <span className="absolute bottom-10 -left-2 w-9 h-9 rounded-full bg-white shadow" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center select-none">
        <AnimatePresence mode="wait">
          {bubbleText && (
            <motion.div
              key={bubbleText}
              initial={{ opacity: 0, y: 10, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              className={`mb-2 max-w-[225px] rounded-2xl px-3.5 py-2 text-center text-xs font-semibold shadow-xl border backdrop-blur-md ${
                isAngry
                  ? 'bg-rose-950/95 border-rose-400/60 text-rose-100'
                  : 'bg-night-900/95 border-amber-300/45 text-amber-100'
              }`}
            >
              {bubbleText}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleInteract}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={t('snowman.aria')}
          whileHover={reducedMotion ? undefined : { scale: 1.06, y: -3 }}
          whileTap={reducedMotion ? undefined : { scale: 0.94 }}
          animate={
            isAngry && !reducedMotion
              ? { x: [-5, 5, -5, 5, 0], rotate: [-2, 2, -2, 2, 0] }
              : clicks === 2 && !reducedMotion
              ? { rotate: [0, -6, 6, -4, 0] }
              : clicks === 1 && !reducedMotion
              ? { y: [0, -6, 0] }
              : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ duration: 0.45 }}
          className="cursor-pointer p-1.5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <svg viewBox="0 0 160 185" className="w-32 sm:w-36 h-auto drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)] overflow-visible">
            <defs>
              <radialGradient id="snowSphere" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="72%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#bae6fd" />
              </radialGradient>
              <linearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>

            {/* Sombra / monte de neve na base */}
            <ellipse cx="80" cy="166" rx="48" ry="10" fill="#cbd5e1" opacity="0.65" />

            {/* Etapa 1: Base grande */}
            {buildStage >= 1 && (
              <motion.g
                initial={reducedMotion ? false : { scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <circle cx="80" cy="140" r="34" fill="url(#snowSphere)" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="80" cy="128" r="3.4" fill="#1e293b" />
                <circle cx="80" cy="142" r="3.4" fill="#1e293b" />
                <circle cx="80" cy="155" r="3.4" fill="#1e293b" />
              </motion.g>
            )}

            {/* Etapa 2: Tronco, braços com luvas e cachecol */}
            {buildStage >= 2 && (
              <motion.g
                initial={reducedMotion ? false : { scale: 0.3, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Braços esquerdo e direito */}
                <path
                  d="M54 96 L22 76 M31 82 L25 68 M34 84 L18 86"
                  stroke="#78350f"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="21" cy="75" r="5" fill="#dc2626" />

                <path
                  d="M106 96 L138 76 M129 82 L135 68 M126 84 L142 86"
                  stroke="#78350f"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="139" cy="75" r="5" fill="#dc2626" />

                {/* Tronco */}
                <circle cx="80" cy="96" r="25" fill="url(#snowSphere)" stroke="#ffffff" strokeWidth="1.5" />

                {/* Cachecol com franjas */}
                <rect x="58" y="72" width="44" height="10" rx="5" fill="url(#scarfGrad)" stroke="#fbbf24" strokeWidth="1" />
                <rect x="86" y="78" width="10" height="26" rx="4" fill="url(#scarfGrad)" />
                <line x1="88" y1="104" x2="88" y2="110" stroke="#fde68a" strokeWidth="1.8" />
                <line x1="91" y1="104" x2="91" y2="110" stroke="#fde68a" strokeWidth="1.8" />
                <line x1="94" y1="104" x2="94" y2="110" stroke="#fde68a" strokeWidth="1.8" />
              </motion.g>
            )}

            {/* Etapa 3: Cabeça, expressões e cartola */}
            {buildStage >= 3 && (
              <motion.g
                initial={reducedMotion ? false : { scale: 0.3, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <circle cx="80" cy="54" r="19" fill="url(#snowSphere)" stroke="#ffffff" strokeWidth="1.5" />

                {/* Bochechas coradas */}
                <circle cx="67" cy="58" r="3.5" fill="#fda4af" opacity="0.7" />
                <circle cx="93" cy="58" r="3.5" fill="#fda4af" opacity="0.7" />

                {/* Olhos */}
                <circle cx="73" cy="50" r="2.7" fill="#0f172a" />
                <circle cx="87" cy="50" r="2.7" fill="#0f172a" />
                <circle cx="72.2" cy="49.2" r="1" fill="#ffffff" />
                <circle cx="86.2" cy="49.2" r="1" fill="#ffffff" />

                {/* Sobrancelhas */}
                {isAngry ? (
                  <>
                    <line x1="68" y1="44" x2="76" y2="47.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="92" y1="44" x2="84" y2="47.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : isHovered || clicks > 0 ? (
                  <>
                    <path d="M69 45 Q73 42 77 45" stroke="#334155" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <path d="M83 45 Q87 42 91 45" stroke="#334155" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  </>
                ) : null}

                {/* Nariz de cenoura */}
                <polygon points="80,53 101,56.5 80,59.5" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />

                {/* Sorriso ou cara brava */}
                {isAngry ? (
                  <path d="M73 65 Q80 59 87 65" stroke="#0f172a" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                ) : clicks === 2 ? (
                  <ellipse cx="80" cy="64" rx="4" ry="3" fill="#0f172a" />
                ) : (
                  <path d="M72 62 Q80 68 88 62" stroke="#0f172a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                )}

                {/* Cartola natalina */}
                <rect x="57" y="34" width="46" height="5" rx="2.5" fill="#1e293b" />
                <rect x="64" y="14" width="32" height="21" rx="3" fill="#1e293b" />
                <rect x="64" y="29" width="32" height="5" fill="#dc2626" />
                <rect x="68" y="17" width="3.5" height="10" rx="1.5" fill="#94a3b8" opacity="0.55" />
              </motion.g>
            )}
          </svg>
        </motion.button>
      </div>
    </>
  );
};
