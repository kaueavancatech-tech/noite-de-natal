import React from 'react';
import {
  Music,
  Sparkles,
  Volume2,
  Square,
  Sun,
  Moon,
  Settings,
  Globe,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageCode, ThemeMode } from '../../types/christmas';

interface HeaderProps {
  isPlayingMusic: boolean;
  onToggleMusicPanel: () => void;
  partyLights: boolean;
  onTogglePartyLights: () => void;
  isTributeActive: boolean;
  onToggleTribute: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPlayingMusic,
  onToggleMusicPanel,
  partyLights,
  onTogglePartyLights,
  isTributeActive,
  onToggleTribute,
  theme,
  onToggleTheme,
  language,
  onChangeLanguage,
  onOpenSettings,
}) => {
  const { t } = useTranslation();

  return (
    <header className="relative z-30 w-full px-4 sm:px-8 pt-4 pb-2">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        {/* Marca */}
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 shadow"
          >
            ❄
          </span>
          <span
            className={`font-display text-2xl sm:text-3xl font-bold tracking-wide ${
              theme === 'light' ? 'text-night-900' : 'text-white'
            }`}
          >
            {t('appTitle')}
          </span>
        </div>

        {/* Controles */}
        <nav aria-label="Controles principais" className="flex flex-wrap items-center gap-2">
          {/* Música */}
          <button
            type="button"
            onClick={onToggleMusicPanel}
            aria-pressed={isPlayingMusic}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isPlayingMusic
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                : theme === 'light'
                ? 'bg-white/80 text-slate-800 border-slate-300 hover:bg-white'
                : 'bg-white/10 text-slate-100 border-white/15 hover:bg-white/20'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>{t('header.music')}</span>
          </button>

          {/* Luzes Festa */}
          <button
            type="button"
            onClick={onTogglePartyLights}
            aria-pressed={partyLights}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              partyLights
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-semibold border-amber-200 shadow-md'
                : theme === 'light'
                ? 'bg-white/80 text-slate-800 border-slate-300 hover:bg-white'
                : 'bg-white/10 text-slate-100 border-white/15 hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{partyLights ? t('header.partyLights') : t('header.normalLights')}</span>
          </button>

          {/* Ouvir Homenagem */}
          <button
            type="button"
            onClick={onToggleTribute}
            aria-pressed={isTributeActive}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              isTributeActive
                ? 'bg-red-600 text-white border-red-400 shadow-md'
                : theme === 'light'
                ? 'bg-white/80 text-slate-800 border-slate-300 hover:bg-white'
                : 'bg-white/10 text-slate-100 border-white/15 hover:bg-white/20'
            }`}
          >
            {isTributeActive ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-4 h-4" />}
            <span>{isTributeActive ? t('header.stopTribute') : t('header.tribute')}</span>
          </button>

          {/* Seletor de idioma */}
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold border ${
              theme === 'light'
                ? 'bg-white/80 text-slate-800 border-slate-300'
                : 'bg-white/10 text-slate-100 border-white/15'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <label htmlFor="lang-select" className="sr-only">
              {t('header.language')}
            </label>
            <select
              id="lang-select"
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="pt-BR" className="bg-slate-900 text-white">PT</option>
              <option value="es" className="bg-slate-900 text-white">ES</option>
              <option value="en" className="bg-slate-900 text-white">EN</option>
            </select>
          </div>

          {/* Tema */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              theme === 'light'
                ? 'bg-night-900 text-amber-300 border-night-800 hover:bg-night-800'
                : 'bg-white/10 text-slate-100 border-white/15 hover:bg-white/20'
            }`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
            <span className="hidden md:inline">
              {theme === 'light' ? t('header.darkTheme') : t('header.lightTheme')}
            </span>
          </button>

          {/* Configurações */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t('header.settings')}
            className={`p-2 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              theme === 'light'
                ? 'bg-white/80 text-slate-800 border-slate-300 hover:bg-white'
                : 'bg-white/10 text-slate-100 border-white/15 hover:bg-white/20'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
};
