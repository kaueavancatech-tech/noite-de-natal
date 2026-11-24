import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, FastForward } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CinematicIntroProps {
  reducedMotion: boolean;
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ reducedMotion, onComplete }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(reducedMotion ? 5 : 1);

  useEffect(() => {
    if (reducedMotion) {
      setStep(5);
      return;
    }
    const timers = [
      window.setTimeout(() => setStep(2), 600),
      window.setTimeout(() => setStep(3), 1400),
      window.setTimeout(() => setStep(4), 2200),
      window.setTimeout(() => setStep(5), 3100),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-night-950 via-night-900 to-night-800 px-5 text-center text-white overflow-hidden"
    >
      {/* Botão pular introdução */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
      >
        <FastForward className="w-3.5 h-3.5" />
        {t('intro.skip')}
      </button>

      {/* Estrelas de fundo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            style={{
              top: `${(i * 19) % 85}%`,
              left: `${(i * 31 + 7) % 94}%`,
              animationDelay: `${(i % 5) * 0.4}s`,
            }}
            className="absolute h-1 w-1 rounded-full bg-amber-100/80 animate-twinkle"
          />
        ))}
      </div>

      {/* Trenó cruzando na etapa 3 */}
      {step >= 3 && !reducedMotion && (
        <motion.div
          initial={{ x: '-40vw', y: -90, opacity: 0 }}
          animate={{ x: '45vw', y: -125, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.6, ease: 'easeOut' }}
          aria-hidden="true"
          className="pointer-events-none absolute text-amber-300 text-sm font-semibold tracking-widest"
        >
          ✦ ✦ ✦ 🦌🛷
        </motion.div>
      )}

      {/* Estrela Dourada */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: step >= 2 ? 1 : 0.2, opacity: step >= 2 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="relative mb-6"
      >
        <div className="absolute -inset-6 rounded-full bg-amber-400/25 blur-2xl" />
        <Sparkles className="relative w-14 h-14 sm:w-16 sm:h-16 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]" />
      </motion.div>

      {/* Título e subtítulo */}
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 18 }}
        transition={{ duration: 0.7 }}
        className="font-display text-4xl sm:text-6xl font-bold text-amber-300 drop-shadow-[0_4px_18px_rgba(251,191,36,0.35)] max-w-2xl"
      >
        {t('intro.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 12 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="mt-3 max-w-md text-sm sm:text-base text-slate-200"
      >
        {t('intro.subtitle')}
      </motion.p>

      {/* Botão entrar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: step >= 5 ? 1 : 0, scale: step >= 5 ? 1 : 0.92 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-red-950/50 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
        >
          <span>{t('intro.enter')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  );
};
