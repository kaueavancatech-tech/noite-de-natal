import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Trash2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal/Modal';
import { WishLetter } from '../../types/christmas';
import { readStorage, writeStorage } from '../../utils/storage';
import { soundEngine } from '../../features/audio/soundEngine';

interface MagicMailboxProps {
  sfxEnabled: boolean;
  onWishSent: () => void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

export const MagicMailbox: React.FC<MagicMailboxProps> = React.memo(({
  sfxEnabled,
  onWishSent,
  externalOpen,
  onExternalClose,
}) => {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [hasWish, setHasWish] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [latestReply, setLatestReply] = useState<string | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [letters, setLetters] = useState<WishLetter[]>(() =>
    readStorage<WishLetter[]>('wish_letters', [])
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleOpen = () => {
    soundEngine.playSfx('chime', sfxEnabled);
    if (externalOpen === undefined) setInternalOpen(true);
  };

  const handleClose = () => {
    if (onExternalClose) onExternalClose();
    if (externalOpen === undefined) setInternalOpen(false);
  };

  const persistLetters = (next: WishLetter[]) => {
    const ok = writeStorage('wish_letters', next);
    setStorageError(!ok);
    setLetters(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawValue = textareaRef.current?.value ?? '';
    const trimmed = rawValue.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    soundEngine.playSfx('mailbox', sfxEnabled);

    const replies = t('mailbox.replies', { returnObjects: true }) as string[];
    const chosenReply = Array.isArray(replies)
      ? replies[Math.floor(Math.random() * replies.length)]
      : '';

    window.setTimeout(() => {
      const entry: WishLetter = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        wish: trimmed,
        reply: chosenReply,
        createdAt: new Date().toLocaleString(),
      };
      persistLetters([entry, ...letters]);
      setLatestReply(chosenReply);
      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      setHasWish(false);
      setIsSending(false);
      onWishSent();
    }, 950);
  };

  const handleDeleteOne = (id: string) => {
    persistLetters(letters.filter((l) => l.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm(t('mailbox.confirmClearHistory'))) {
      persistLetters([]);
      setLatestReply(null);
    }
  };

  return (
    <>
      {/* Caixa de correio integrada ao cenário */}
      <motion.button
        type="button"
        onClick={handleOpen}
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.96 }}
        aria-label={t('mailbox.title')}
        className="group relative flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl p-1.5"
      >
        <div className="absolute -inset-2 rounded-full bg-amber-400/20 blur-xl opacity-60 group-hover:opacity-100 transition" />
        <svg viewBox="0 0 110 140" className="w-24 sm:w-28 h-auto drop-shadow-lg relative">
          {/* Poste */}
          <rect x="49" y="68" width="12" height="62" rx="3" fill="#78350f" />
          <ellipse cx="55" cy="130" rx="28" ry="7" fill="#e0f2fe" />
          {/* Corpo da caixa vermelha */}
          <path d="M22 44 A24 24 0 0 1 70 44 L88 44 L88 72 L22 72 Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="2" />
          {/* Porta frontal */}
          <path d="M22 44 A20 20 0 0 1 46 44 L46 72 L22 72 Z" fill="#991b1b" />
          {/* Bandeirinha dourada */}
          <rect x="64" y="22" width="4" height="24" rx="2" fill="#fbbf24" />
          <polygon points="68,22 84,27 68,33" fill="#fde047" />
          {/* Envelope saindo */}
          <rect x="25" y="49" width="18" height="12" rx="2" fill="#fef3c7" />
          <polyline points="25,49 34,56 43,49" fill="none" stroke="#dc2626" strokeWidth="1.5" />
        </svg>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-red-600/90 border border-amber-300/50 px-3 py-1 text-xs font-semibold text-amber-100 shadow">
          <Mail className="w-3.5 h-3.5 text-amber-300" />
          {t('cta.magicMailbox')}
        </span>
      </motion.button>

      {/* Modal do Correio Mágico */}
      <Modal isOpen={isOpen} onClose={handleClose} title={t('mailbox.title')} maxWidthClass="max-w-xl">
        <p className="text-xs sm:text-sm text-slate-300 mb-4">{t('mailbox.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="wish-input" className="block text-sm font-semibold text-amber-200">
            {t('mailbox.promptQuestion')}
          </label>
          <textarea
            ref={textareaRef}
            id="wish-input"
            name="wish"
            rows={4}
            defaultValue=""
            autoComplete="off"
            spellCheck={true}
            onInput={(e) => {
              const val = e.currentTarget.value.trim().length > 0;
              setHasWish((prev) => (prev === val ? prev : val));
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            onKeyUp={(e) => {
              e.stopPropagation();
            }}
            placeholder={t('mailbox.placeholder')}
            className="w-full rounded-xl border border-amber-300/35 bg-slate-950/90 p-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-text select-text"
          />

          <button
            type="submit"
            disabled={!hasWish || isSending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition"
          >
            <Send className="w-4 h-4" />
            {isSending ? t('mailbox.sending') : t('mailbox.sendBtn')}
          </button>
        </form>

        {latestReply && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-amber-300/40 bg-amber-400/15 p-4 text-sm text-amber-100"
          >
            <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>{t('mailbox.santaReplyLabel')}</span>
            </div>
            <p>{latestReply}</p>
          </motion.div>
        )}

        {storageError && (
          <p className="mt-3 text-xs text-rose-300">{t('mailbox.storageWarning')}</p>
        )}

        {/* Histórico local */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-slate-200">{t('mailbox.historyTitle')}</h3>
            {letters.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-300 hover:text-rose-200 underline"
              >
                {t('mailbox.clearHistory')}
              </button>
            )}
          </div>

          {letters.length === 0 ? (
            <p className="text-xs text-slate-400">{t('mailbox.emptyHistory')}</p>
          ) : (
            <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {letters.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-slate-400">{item.createdAt}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteOne(item.id)}
                      aria-label={t('mailbox.deleteLetter')}
                      className="text-slate-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-100 font-medium">“{item.wish}”</p>
                  <p className="text-amber-200/90 italic">🎅 {item.reply}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
});
