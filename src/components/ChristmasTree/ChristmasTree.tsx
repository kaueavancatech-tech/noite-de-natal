import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { soundEngine } from '../../features/audio/soundEngine';

interface ChristmasTreeProps {
  partyLights: boolean;
  sfxEnabled: boolean;
  reducedMotion: boolean;
}

const LIGHT_BULBS = [
  { cx: 150, cy: 95, color: '#ef4444', delay: 0 },
  { cx: 132, cy: 132, color: '#3b82f6', delay: 0.3 },
  { cx: 168, cy: 138, color: '#facc15', delay: 0.6 },
  { cx: 118, cy: 175, color: '#22c55e', delay: 0.2 },
  { cx: 152, cy: 182, color: '#ef4444', delay: 0.8 },
  { cx: 184, cy: 178, color: '#3b82f6', delay: 0.4 },
  { cx: 102, cy: 222, color: '#facc15', delay: 0.5 },
  { cx: 136, cy: 230, color: '#ec4899', delay: 0.9 },
  { cx: 168, cy: 226, color: '#22c55e', delay: 0.1 },
  { cx: 198, cy: 224, color: '#ef4444', delay: 0.7 },
  { cx: 90, cy: 268, color: '#3b82f6', delay: 0.35 },
  { cx: 125, cy: 274, color: '#facc15', delay: 0.65 },
  { cx: 160, cy: 272, color: '#ef4444', delay: 0.15 },
  { cx: 195, cy: 270, color: '#22c55e', delay: 0.85 },
];

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({
  partyLights,
  sfxEnabled,
  reducedMotion,
}) => {
  const { t } = useTranslation();
  const [starBurst, setStarBurst] = useState(false);
  const [activeGiftMsg, setActiveGiftMsg] = useState<string | null>(null);

  const giftMessages = t('tree.gifts', { returnObjects: true }) as string[];

  const handleStarClick = () => {
    soundEngine.playSfx('chime', sfxEnabled);
    setStarBurst(true);
    setActiveGiftMsg(t('tree.starWish'));
    window.setTimeout(() => setStarBurst(false), 1800);
  };

  const handleGiftClick = (index: number) => {
    soundEngine.playSfx('gift', sfxEnabled);
    const msg = Array.isArray(giftMessages)
      ? giftMessages[index % giftMessages.length]
      : '';
    setActiveGiftMsg(msg);
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Halo luminoso atrás da árvore */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-4 rounded-full blur-3xl transition-all duration-700 ${
          partyLights
            ? 'bg-gradient-to-tr from-amber-400/35 via-rose-500/25 to-emerald-400/35 scale-110'
            : 'bg-amber-300/15 scale-100'
        }`}
      />

      {/* Balão de mensagem ao clicar na estrela ou presentes */}
      <AnimatePresence mode="wait">
        {activeGiftMsg && (
          <motion.div
            key={activeGiftMsg}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="mb-2 max-w-xs rounded-2xl border border-amber-300/40 bg-night-900/90 px-4 py-2.5 text-center text-xs sm:text-sm text-amber-100 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center justify-center gap-1.5 font-semibold text-amber-300 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('tree.giftTitle')}</span>
            </div>
            <p>{activeGiftMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Árvore SVG completa e interativa */}
      <svg
        viewBox="0 0 300 355"
        className="w-64 sm:w-72 md:w-80 h-auto drop-shadow-[0_14px_26px_rgba(0,0,0,0.45)] overflow-visible"
      >
        <defs>
          <linearGradient id="treeGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={partyLights ? '#22c55e' : '#16a34a'} />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
          <linearGradient id="treeGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={partyLights ? '#4ade80' : '#15803d'} />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base de neve no chão */}
        <ellipse cx="150" cy="332" rx="118" ry="16" fill="#e0f2fe" opacity="0.9" />

        {/* Tronco */}
        <rect x="134" y="285" width="32" height="44" rx="4" fill="#78350f" />

        {/* Camadas da árvore */}
        <polygon points="150,155 56,292 244,292" fill="url(#treeGrad2)" />
        <polygon points="150,110 72,232 228,232" fill="url(#treeGrad1)" />
        <polygon points="150,65 92,168 208,168" fill="url(#treeGrad2)" />
        <polygon points="150,36 112,112 188,112" fill="url(#treeGrad1)" />

        {/* Festões dourados */}
        <path
          d="M116 105 Q150 122 184 105 M96 160 Q150 182 204 160 M76 222 Q150 248 224 222 M62 280 Q150 308 238 280"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.4"
          strokeDasharray="4 4"
          opacity={partyLights ? 0.95 : 0.65}
        />

        {/* Luzes coloridas */}
        {LIGHT_BULBS.map((bulb, idx) => (
          <g key={idx}>
            <circle
              cx={bulb.cx}
              cy={bulb.cy}
              r={partyLights ? 9 : 6}
              fill={bulb.color}
              opacity={partyLights ? 0.45 : 0.25}
              className={reducedMotion ? '' : 'animate-pulse'}
              style={{ animationDelay: `${bulb.delay}s` }}
            />
            <circle
              cx={bulb.cx}
              cy={bulb.cy}
              r={partyLights ? 4.8 : 3.8}
              fill={bulb.color}
              className={reducedMotion ? '' : 'animate-twinkle'}
              style={{ animationDelay: `${bulb.delay}s` }}
            />
          </g>
        ))}

        {/* Estrela interativa no topo */}
        <g
          role="button"
          tabIndex={0}
          aria-label={t('tree.starAria')}
          onClick={handleStarClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStarClick();
            }
          }}
          className="cursor-pointer focus:outline-none"
        >
          <circle
            cx="150"
            cy="32"
            r={starBurst ? 36 : partyLights ? 26 : 19}
            fill="url(#starGlow)"
            className="transition-all duration-500"
          />
          <polygon
            points="150,10 156,24 172,25 160,35 164,50 150,41 136,50 140,35 128,25 144,24"
            fill="#fde047"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
        </g>

        {/* Presentes interativos sob a árvore */}
        {/* Presente 1 - Vermelho */}
        <g
          role="button"
          tabIndex={0}
          aria-label={t('tree.giftAria', { number: 1 })}
          onClick={() => handleGiftClick(0)}
          onKeyDown={(e) => e.key === 'Enter' && handleGiftClick(0)}
          className="cursor-pointer hover:brightness-110 transition"
        >
          <rect x="74" y="294" width="38" height="34" rx="5" fill="#dc2626" />
          <rect x="90" y="294" width="6" height="34" fill="#fbbf24" />
          <rect x="74" y="308" width="38" height="6" fill="#fbbf24" />
        </g>

        {/* Presente 2 - Azul */}
        <g
          role="button"
          tabIndex={0}
          aria-label={t('tree.giftAria', { number: 2 })}
          onClick={() => handleGiftClick(1)}
          onKeyDown={(e) => e.key === 'Enter' && handleGiftClick(1)}
          className="cursor-pointer hover:brightness-110 transition"
        >
          <rect x="118" y="300" width="32" height="28" rx="5" fill="#2563eb" />
          <rect x="131" y="300" width="6" height="28" fill="#ffffff" />
          <rect x="118" y="311" width="32" height="5" fill="#ffffff" />
        </g>

        {/* Presente 3 - Dourado */}
        <g
          role="button"
          tabIndex={0}
          aria-label={t('tree.giftAria', { number: 3 })}
          onClick={() => handleGiftClick(2)}
          onKeyDown={(e) => e.key === 'Enter' && handleGiftClick(2)}
          className="cursor-pointer hover:brightness-110 transition"
        >
          <rect x="162" y="296" width="36" height="32" rx="5" fill="#f59e0b" />
          <rect x="177" y="296" width="6" height="32" fill="#dc2626" />
          <rect x="162" y="309" width="36" height="6" fill="#dc2626" />
        </g>

        {/* Presente 4 - Esmeralda */}
        <g
          role="button"
          tabIndex={0}
          aria-label={t('tree.giftAria', { number: 4 })}
          onClick={() => handleGiftClick(3)}
          onKeyDown={(e) => e.key === 'Enter' && handleGiftClick(3)}
          className="cursor-pointer hover:brightness-110 transition"
        >
          <rect x="204" y="303" width="28" height="25" rx="4" fill="#059669" />
          <rect x="216" y="303" width="5" height="25" fill="#fde68a" />
          <rect x="204" y="313" width="28" height="5" fill="#fde68a" />
        </g>
      </svg>
    </div>
  );
};
