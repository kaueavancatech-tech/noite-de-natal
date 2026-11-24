import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Flame, Plus, Trash2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal/Modal';
import { readStorage, writeStorage } from '../../utils/storage';
import { soundEngine } from '../../features/audio/soundEngine';

interface SantaListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sfxEnabled: boolean;
}

export const SantaListsModal: React.FC<SantaListsModalProps> = ({
  isOpen,
  onClose,
  sfxEnabled,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'nice' | 'naughty'>('nice');
  const [niceNames, setNiceNames] = useState<string[]>(() =>
    readStorage<string[]>('nice_list', [])
  );
  const [naughtyNames, setNaughtyNames] = useState<string[]>(() =>
    readStorage<string[]>('naughty_list', [])
  );
  const [inputName, setInputName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [resultBanner, setResultBanner] = useState<{
    type: 'nice' | 'naughty';
    name: string;
    message: string;
  } | null>(null);

  const saveNice = (next: string[]) => {
    setNiceNames(next);
    writeStorage('nice_list', next);
  };

  const saveNaughty = (next: string[]) => {
    setNaughtyNames(next);
    writeStorage('naughty_list', next);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputName.trim();
    if (!cleaned) return;
    soundEngine.playSfx('chime', sfxEnabled);

    if (tab === 'nice') {
      saveNice([...niceNames, cleaned]);
    } else {
      saveNaughty([...naughtyNames, cleaned]);
    }
    setInputName('');
  };

  const handleRemove = (index: number) => {
    if (tab === 'nice') {
      saveNice(niceNames.filter((_, i) => i !== index));
    } else {
      saveNaughty(naughtyNames.filter((_, i) => i !== index));
    }
  };

  const handleClear = () => {
    if (!window.confirm(t('lists.confirmClear'))) return;
    if (tab === 'nice') saveNice([]);
    else saveNaughty([]);
    setResultBanner(null);
  };

  const handleDrawWinner = () => {
    if (niceNames.length === 0 || isDrawing) return;
    setIsDrawing(true);
    setResultBanner(null);
    soundEngine.playSfx('draw', sfxEnabled);

    window.setTimeout(() => {
      const winner = niceNames[Math.floor(Math.random() * niceNames.length)];
      const templates = t('lists.winnerMessages', { returnObjects: true }) as string[];
      const rawTpl = Array.isArray(templates)
        ? templates[Math.floor(Math.random() * templates.length)]
        : '{{name}}';
      setResultBanner({
        type: 'nice',
        name: winner,
        message: rawTpl.replace('{{name}}', winner),
      });
      setIsDrawing(false);
      soundEngine.playSfx('gift', sfxEnabled);
    }, 1000);
  };

  const handleSelectNaughty = (name: string) => {
    soundEngine.playSfx('chime', sfxEnabled);
    const templates = t('lists.coalJokeMessages', { returnObjects: true }) as string[];
    const rawTpl = Array.isArray(templates)
      ? templates[Math.floor(Math.random() * templates.length)]
      : '{{name}}';
    setResultBanner({
      type: 'naughty',
      name,
      message: rawTpl.replace('{{name}}', name),
    });
  };

  const currentList = tab === 'nice' ? niceNames : naughtyNames;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('lists.title')} maxWidthClass="max-w-xl">
      <p className="text-xs text-slate-300 mb-4">{t('lists.subtitle')}</p>

      {/* Abas */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-4">
        <button
          type="button"
          onClick={() => {
            setTab('nice');
            setResultBanner(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition ${
            tab === 'nice'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Gift className="w-4 h-4" />
          {t('lists.niceTab')} ({niceNames.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('naughty');
            setResultBanner(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition ${
            tab === 'naughty'
              ? 'bg-amber-700 text-amber-100 shadow'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <Flame className="w-4 h-4" />
          {t('lists.naughtyTab')} ({naughtyNames.length})
        </button>
      </div>

      {/* Formulário para adicionar */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder={tab === 'nice' ? t('lists.placeholderNice') : t('lists.placeholderNaughty')}
          className="flex-1 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputName.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition"
        >
          <Plus className="w-4 h-4" />
          {t('lists.add')}
        </button>
      </form>

      {/* Lista de nomes */}
      {currentList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 p-5 text-center text-xs sm:text-sm text-slate-400">
          {tab === 'nice' ? t('lists.emptyNice') : t('lists.emptyNaughty')}
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1">
            {currentList.map((name, idx) => (
              <li
                key={`${name}-${idx}`}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm border ${
                  tab === 'nice'
                    ? 'bg-emerald-950/60 border-emerald-400/30 text-emerald-100'
                    : 'bg-stone-800/90 border-amber-500/30 text-amber-100'
                }`}
              >
                {tab === 'naughty' ? (
                  <button
                    type="button"
                    onClick={() => handleSelectNaughty(name)}
                    className="inline-flex items-center gap-1.5 hover:underline font-medium"
                  >
                    <span aria-hidden="true">🪨</span>
                    <span>{name}</span>
                  </button>
                ) : (
                  <span className="font-medium">{name}</span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  aria-label={t('lists.remove', { name })}
                  className="text-slate-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            {tab === 'nice' && (
              <button
                type="button"
                onClick={handleDrawWinner}
                disabled={isDrawing}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110 disabled:opacity-60 transition"
              >
                <Sparkles className="w-4 h-4" />
                {isDrawing
                  ? t('lists.drawing')
                  : resultBanner?.type === 'nice'
                  ? t('lists.drawAgain')
                  : t('lists.drawBtn')}
              </button>
            )}

            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-300 hover:text-rose-200 underline ml-auto"
            >
              {t('lists.clearList')}
            </button>
          </div>
        </div>
      )}

      {/* Resultado do sorteio ou brincadeira do carvão */}
      <AnimatePresence mode="wait">
        {resultBanner && (
          <motion.div
            key={`${resultBanner.type}-${resultBanner.name}-${resultBanner.message}`}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 rounded-2xl border p-4 text-sm ${
              resultBanner.type === 'nice'
                ? 'border-amber-300/50 bg-gradient-to-br from-emerald-900/70 to-amber-900/50 text-amber-100'
                : 'border-amber-500/40 bg-stone-800/90 text-amber-100'
            }`}
          >
            <div className="font-display text-xl font-bold text-amber-300 mb-1">
              {resultBanner.type === 'nice'
                ? t('lists.winnerTitle', { name: resultBanner.name })
                : t('lists.coalJokeTitle', { name: resultBanner.name })}
            </div>
            <p>{resultBanner.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};
