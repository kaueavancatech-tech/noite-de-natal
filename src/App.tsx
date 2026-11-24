import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Flame,
  Gift,
  Mail,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  RotateCcw,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppSettings, LanguageCode, ThemeMode } from './types/christmas';
import { readStorage, writeStorage } from './utils/storage';
import { PLAYLIST, soundEngine } from './features/audio/soundEngine';
import { useChristmasCountdown } from './features/countdown/useChristmasCountdown';
import { useTimedEvents } from './features/events/useTimedEvents';
import { SnowCanvas } from './components/SnowCanvas/SnowCanvas';
import { CinematicIntro } from './components/Intro/CinematicIntro';
import { Header } from './components/Header/Header';
import { ChristmasTree } from './components/ChristmasTree/ChristmasTree';
import { SantaSleigh } from './components/SantaSleigh/SantaSleigh';
import { Snowman } from './components/Snowman/Snowman';
import { MagicMailbox } from './components/MagicMailbox/MagicMailbox';
import { SantaListsModal } from './components/GiftDraw/SantaListsModal';
import { Modal } from './components/Modal/Modal';

const DEFAULT_SETTINGS: AppSettings = {
  volume: 0.65,
  sfxEnabled: true,
  particlesEnabled: true,
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
};

export function App() {
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState<LanguageCode>(() =>
    readStorage<LanguageCode>('language', 'pt-BR')
  );
  const [theme, setTheme] = useState<ThemeMode>(() =>
    readStorage<ThemeMode>('theme', 'dark')
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    readStorage<AppSettings>('settings', DEFAULT_SETTINGS)
  );
  const [showIntro, setShowIntro] = useState<boolean>(() =>
    !readStorage<boolean>('intro_seen', false)
  );

  // Organização limpa do painel principal: 'message' | 'status'
  const [cardTab, setCardTab] = useState<'message' | 'status'>('message');

  // Estados de iluminação, áudio e modais
  const [partyLights, setPartyLights] = useState<boolean>(false);
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isSynthAudio, setIsSynthAudio] = useState<boolean>(false);
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);
  const [showListsModal, setShowListsModal] = useState<boolean>(false);
  const [showMailboxModal, setShowMailboxModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Homenagem narrada
  const [isTributeActive, setIsTributeActive] = useState<boolean>(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(-1);
  const tributeAudioRef = useRef<HTMLAudioElement | null>(null);

  const countdown = useChristmasCountdown();
  const {
    sleighSecondsLeft,
    isSleighFlying,
    launchSleigh,
    shootingStarTrigger,
    triggerShootingStar,
  } = useTimedEvents(settings.reducedMotion);

  useEffect(() => {
    soundEngine.setVolume(settings.volume);
    writeStorage('settings', settings);
  }, [settings]);

  useEffect(() => {
    writeStorage('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleLanguageChange = (lang: LanguageCode) => {
    stopTribute();
    setLanguage(lang);
    i18n.changeLanguage(lang);
    writeStorage('language', lang);
  };

  const handleCompleteIntro = () => {
    setShowIntro(false);
    writeStorage('intro_seen', true);
  };

  const startTrack = useCallback((index: number) => {
    const safeIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    setTrackIndex(safeIndex);
    soundEngine.playTrack(
      PLAYLIST[safeIndex],
      () => startTrack(safeIndex + 1),
      (playing, synth) => {
        setIsPlayingMusic(playing);
        setIsSynthAudio(synth);
      }
    );
  }, []);

  const togglePlayPauseMusic = () => {
    if (isPlayingMusic) {
      soundEngine.pauseMusic();
      setIsPlayingMusic(false);
    } else {
      startTrack(trackIndex);
    }
  };

  const handleIgniteMagic = () => {
    setPartyLights(true);
    soundEngine.playSfx('party', settings.sfxEnabled);
    if (!isPlayingMusic) {
      startTrack(trackIndex);
    }
    if (!isSleighFlying) {
      launchSleigh();
    }
    triggerShootingStar();
  };

  const stopTribute = useCallback(() => {
    if (tributeAudioRef.current) {
      tributeAudioRef.current.pause();
      tributeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    soundEngine.setDucking(false);
    setIsTributeActive(false);
    setActiveSentenceIdx(-1);
  }, []);

  const startTribute = () => {
    stopTribute();
    setIsTributeActive(true);
    soundEngine.setDucking(true);

    const sentences = t('tribute.sentences', { returnObjects: true }) as string[];
    const audioPath = `/audio/homenagem-${language}.mp3`;
    const audio = new Audio(audioPath);
    audio.volume = Math.min(1, settings.volume + 0.2);
    tributeAudioRef.current = audio;

    audio.onended = () => stopTribute();
    audio.onerror = () => {
      tributeAudioRef.current = null;
      if (!('speechSynthesis' in window) || !Array.isArray(sentences)) {
        stopTribute();
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = language.slice(0, 2).toLowerCase();
      const matchingVoices = voices.filter((v) =>
        v.lang.toLowerCase().startsWith(langPrefix)
      );
      const preferredVoice =
        matchingVoices.find((v) => /daniel|felipe|jorge|male|ricardo|carlos|david/i.test(v.name)) ||
        matchingVoices[0];

      let idx = 0;
      const speakNext = () => {
        if (idx >= sentences.length) {
          stopTribute();
          return;
        }
        setActiveSentenceIdx(idx);
        const utter = new SpeechSynthesisUtterance(sentences[idx]);
        utter.lang = language;
        if (preferredVoice) utter.voice = preferredVoice;
        utter.pitch = 0.86;
        utter.rate = 0.94;
        utter.volume = Math.min(1, settings.volume + 0.25);
        utter.onend = () => {
          idx += 1;
          speakNext();
        };
        utter.onerror = () => stopTribute();
        window.speechSynthesis.speak(utter);
      };

      speakNext();
    };

    audio.play().catch(() => {
      audio.onerror?.(new Event('error'));
    });
  };

  const handleToggleTribute = () => {
    if (isTributeActive) {
      stopTribute();
    } else {
      startTribute();
    }
  };

  useEffect(() => {
    return () => {
      soundEngine.stopMusic();
      stopTribute();
    };
  }, [stopTribute]);

  const tributeSentences = t('tribute.sentences', { returnObjects: true }) as string[];

  return (
    <div
      className={`relative min-h-screen flex flex-col justify-between transition-colors duration-700 ${
        theme === 'light'
          ? 'bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-100 text-slate-900'
          : 'bg-gradient-to-b from-night-950 via-night-900 to-night-800 text-white'
      }`}
    >
      {/* Lua cheia e brilho celestial no fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-20 right-[14%] z-0 hidden md:block"
      >
        <div className="w-20 h-20 rounded-full bg-amber-100/20 blur-2xl absolute -inset-4" />
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-300/80 shadow-[0_0_28px_rgba(253,224,71,0.45)] opacity-85" />
      </div>

      {/* Paisagem distante de montanhas nevadas */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 w-full h-36 sm:h-48 opacity-45"
      >
        <path
          d="M0 150 L240 65 L490 145 L760 50 L1060 140 L1300 72 L1440 120 L1440 220 L0 220 Z"
          fill={theme === 'light' ? '#93c5fd' : '#1e293b'}
        />
        <path
          d="M0 175 L310 105 L620 170 L940 95 L1240 165 L1440 135 L1440 220 L0 220 Z"
          fill={theme === 'light' ? '#bfdbfe' : '#0f172a'}
        />
      </svg>

      {/* Brilho ambiental do modo Luzes Festa */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 ${
          partyLights ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle at 20% 25%, rgba(251,191,36,0.24), transparent 45%), radial-gradient(circle at 80% 30%, rgba(239,68,68,0.22), transparent 48%), radial-gradient(circle at 50% 80%, rgba(34,197,94,0.20), transparent 50%)',
        }}
      />

      {/* Abertura cinematográfica */}
      <AnimatePresence>
        {showIntro && (
          <CinematicIntro
            reducedMotion={settings.reducedMotion}
            onComplete={handleCompleteIntro}
          />
        )}
      </AnimatePresence>

      {/* Camada de neve e estrelas cadentes */}
      <SnowCanvas
        enabled={settings.particlesEnabled}
        reducedMotion={settings.reducedMotion}
        partyLights={partyLights}
        theme={theme}
        shootingStarTrigger={shootingStarTrigger}
      />

      {/* Trenó periódico no céu */}
      <SantaSleigh isFlying={isSleighFlying} partyLights={partyLights} />

      {/* Cabeçalho */}
      <Header
        isPlayingMusic={isPlayingMusic}
        onToggleMusicPanel={() => setShowMusicModal(true)}
        partyLights={partyLights}
        onTogglePartyLights={() => {
          const next = !partyLights;
          setPartyLights(next);
          if (next) soundEngine.playSfx('party', settings.sfxEnabled);
        }}
        isTributeActive={isTributeActive}
        onToggleTribute={handleToggleTribute}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        language={language}
        onChangeLanguage={handleLanguageChange}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Cenário Principal */}
      <main className="relative z-20 mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8 py-3 sm:py-5 flex flex-col lg:flex-row items-center justify-between gap-7">
        {/* Coluna Esquerda: Painel Organizado com Abas */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className={`w-full lg:w-[54%] rounded-3xl p-5 sm:p-7 border backdrop-blur-md shadow-2xl transition-colors ${
            theme === 'light'
              ? 'bg-white/85 border-sky-300/60 shadow-sky-900/10'
              : 'bg-night-800/80 border-indigo-300/20 shadow-black/45'
          }`}
        >
          {/* Topo organizado: Edição + Seletor de visualização do cartão */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-400">
              {t('specialEdition')}
            </p>
            <div className="inline-flex rounded-full p-1 bg-black/20 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setCardTab('message')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  cardTab === 'message'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('appTitle')}
              </button>
              <button
                type="button"
                onClick={() => setCardTab('status')}
                className={`px-3 py-1 rounded-full font-semibold transition ${
                  cardTab === 'status'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('countdown.christmasLabel').split(' ')[0]} &amp; 🛷
              </button>
            </div>
          </div>

          <h1
            className={`font-display text-4xl sm:text-5xl font-bold leading-tight mb-3 ${
              theme === 'light' ? 'text-amber-600' : 'text-amber-300'
            }`}
          >
            {t('heroTitle')}
          </h1>

          {cardTab === 'message' ? (
            <>
              <div
                className={`text-sm sm:text-base leading-relaxed mb-5 ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                {isTributeActive && Array.isArray(tributeSentences) ? (
                  <p>
                    {tributeSentences.map((sentence, idx) => (
                      <span
                        key={idx}
                        className={`transition-colors rounded px-1 ${
                          activeSentenceIdx === idx
                            ? 'bg-amber-400/30 text-amber-200 font-semibold'
                            : ''
                        }`}
                      >
                        {sentence}{' '}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p>{t('heroBody')}</p>
                )}
              </div>

              {/* 3 Pilares */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { title: t('pillars.peaceTitle'), desc: t('pillars.peaceDesc') },
                  { title: t('pillars.gratitudeTitle'), desc: t('pillars.gratitudeDesc') },
                  { title: t('pillars.dreamsTitle'), desc: t('pillars.dreamsDesc') },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl p-3.5 border ${
                      theme === 'light'
                        ? 'bg-sky-50/90 border-sky-200'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <h2
                      className={`text-sm font-bold mb-1 ${
                        theme === 'light' ? 'text-amber-700' : 'text-amber-300'
                      }`}
                    >
                      {item.title}
                    </h2>
                    <p
                      className={`text-xs leading-relaxed ${
                        theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
              <div
                className={`rounded-2xl p-4 border ${
                  theme === 'light'
                    ? 'bg-sky-50/90 border-sky-200'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{t('countdown.christmasLabel')}</span>
                </div>
                {countdown.isChristmasDay ? (
                  <p className="text-sm font-bold text-amber-300">
                    {t('countdown.merryChristmas')}
                  </p>
                ) : (
                  <p className="text-lg sm:text-xl font-bold">
                    {countdown.days} {t('countdown.days')} ·{' '}
                    {String(countdown.hours).padStart(2, '0')} {t('countdown.hours')} ·{' '}
                    {String(countdown.minutes).padStart(2, '0')} {t('countdown.minutes')} ·{' '}
                    {String(countdown.seconds).padStart(2, '0')} {t('countdown.seconds')}
                  </p>
                )}
              </div>

              <div
                className={`rounded-2xl p-4 border flex flex-col justify-between ${
                  theme === 'light'
                    ? 'bg-sky-50/90 border-sky-200'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>🛷</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {isSleighFlying
                      ? t('countdown.sleighFlying')
                      : t('countdown.sleighNext', { seconds: sleighSecondsLeft })}
                  </p>
                </div>
                {!isSleighFlying && (
                  <button
                    type="button"
                    onClick={launchSleigh}
                    className="mt-2.5 self-start rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-400/30 transition"
                  >
                    ✦ 🛷
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ações Principais */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <button
              type="button"
              onClick={handleIgniteMagic}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-950/40 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
            >
              <Flame className="w-4 h-4 text-amber-200" />
              <span>{partyLights ? t('cta.magicActive') : t('cta.igniteMagic')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowListsModal(true)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                theme === 'light'
                  ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'
                  : 'bg-emerald-600/90 text-white border-emerald-400/40 hover:bg-emerald-500'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>{t('cta.santaList')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMailboxModal(true)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                theme === 'light'
                  ? 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  : 'bg-white/10 text-amber-200 border-amber-300/30 hover:bg-white/20'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{t('cta.magicMailbox')}</span>
            </button>
          </div>

          {/* Barra inferior compacta e limpa */}
          <div
            className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-xs ${
              theme === 'light'
                ? 'border-slate-200 text-slate-700'
                : 'border-white/10 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <span aria-hidden="true">🛷</span>
              <span>
                {isSleighFlying
                  ? t('countdown.sleighFlying')
                  : t('countdown.sleighNext', { seconds: sleighSecondsLeft })}
              </span>
            </div>

            <div className="flex items-center gap-2 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {countdown.isChristmasDay ? (
                <span className="text-amber-400">{t('countdown.merryChristmas')}</span>
              ) : (
                <span>
                  {t('countdown.christmasLabel')}:{' '}
                  <strong className="text-amber-400">
                    {countdown.days}
                    {t('countdown.days')[0]} {String(countdown.hours).padStart(2, '0')}h{' '}
                    {String(countdown.minutes).padStart(2, '0')}m{' '}
                    {String(countdown.seconds).padStart(2, '0')}s
                  </strong>
                </span>
              )}
            </div>
          </div>
        </motion.section>

        {/* Coluna Direita: Mundo Interativo */}
        <section
          aria-label="Cenário natalino interativo"
          className="w-full lg:w-[46%] flex flex-col items-center justify-end"
        >
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-3">
            <div className="order-2 sm:order-1">
              <Snowman
                sfxEnabled={settings.sfxEnabled}
                reducedMotion={settings.reducedMotion}
              />
            </div>

            <div className="order-1 sm:order-2">
              <ChristmasTree
                partyLights={partyLights}
                sfxEnabled={settings.sfxEnabled}
                reducedMotion={settings.reducedMotion}
              />
            </div>

            <div className="order-3">
              <MagicMailbox
                sfxEnabled={settings.sfxEnabled}
                onWishSent={triggerShootingStar}
                externalOpen={showMailboxModal}
                onExternalClose={() => setShowMailboxModal(false)}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé discreto */}
      <footer className="relative z-20 px-4 sm:px-8 pb-3 pt-1 text-center">
        <button
          type="button"
          onClick={() => setShowIntro(true)}
          className={`inline-flex items-center gap-1.5 text-xs underline opacity-75 hover:opacity-100 transition ${
            theme === 'light' ? 'text-slate-700' : 'text-slate-300'
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('cta.replayIntro')}</span>
        </button>
      </footer>

      {/* Modal: Playlist Musical */}
      <Modal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        title={t('audio.playlistTitle')}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-300/30 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                {isPlayingMusic ? t('audio.playing') : t('audio.paused')}
              </span>
              {isSynthAudio && (
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] text-amber-200">
                  {t('audio.synthBadge')}
                </span>
              )}
            </div>
            <p className="text-base font-bold text-white">
              {t(PLAYLIST[trackIndex].titleKey)}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => startTrack(trackIndex - 1)}
              aria-label={t('audio.prev')}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={togglePlayPauseMusic}
              aria-label={isPlayingMusic ? t('audio.pause') : t('audio.play')}
              className="p-4 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg transition"
            >
              {isPlayingMusic ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              type="button"
              onClick={() => startTrack(trackIndex + 1)}
              aria-label={t('audio.next')}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <ul className="space-y-1.5">
            {PLAYLIST.map((track, idx) => (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => startTrack(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${
                    idx === trackIndex
                      ? 'bg-amber-400/20 border border-amber-300/40 text-amber-200 font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <span>{t(track.titleKey)}</span>
                  {idx === trackIndex && isPlayingMusic && <span>♪</span>}
                </button>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <label
              htmlFor="music-vol"
              className="flex items-center justify-between text-xs text-slate-300 mb-1.5"
            >
              <span className="inline-flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-300" />
                {t('audio.volume')}
              </span>
              <span>{Math.round(settings.volume * 100)}%</span>
            </label>
            <input
              id="music-vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) =>
                setSettings((s) => ({ ...s, volume: parseFloat(e.target.value) }))
              }
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Lista de Presentes e Lista de Carvão */}
      <SantaListsModal
        isOpen={showListsModal}
        onClose={() => setShowListsModal(false)}
        sfxEnabled={settings.sfxEnabled}
      />

      {/* Modal: Configurações e Acessibilidade */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title={t('settings.title')}
      >
        <div className="space-y-4 text-sm">
          <div>
            <label
              htmlFor="global-vol"
              className="flex items-center justify-between text-slate-200 font-medium mb-1.5"
            >
              <span>{t('settings.volume')}</span>
              <span>{Math.round(settings.volume * 100)}%</span>
            </label>
            <input
              id="global-vol"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.volume}
              onChange={(e) =>
                setSettings((s) => ({ ...s, volume: parseFloat(e.target.value) }))
              }
              className="w-full accent-amber-400"
            />
          </div>

          <label className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10">
            <span>{t('settings.sfx')}</span>
            <input
              type="checkbox"
              checked={settings.sfxEnabled}
              onChange={(e) =>
                setSettings((s) => ({ ...s, sfxEnabled: e.target.checked }))
              }
              className="h-4 w-4 accent-amber-400"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10">
            <span>{t('settings.particles')}</span>
            <input
              type="checkbox"
              checked={settings.particlesEnabled}
              onChange={(e) =>
                setSettings((s) => ({ ...s, particlesEnabled: e.target.checked }))
              }
              className="h-4 w-4 accent-amber-400"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10">
            <span>{t('settings.reducedMotion')}</span>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) =>
                setSettings((s) => ({ ...s, reducedMotion: e.target.checked }))
              }
              className="h-4 w-4 accent-amber-400"
            />
          </label>

          <p className="rounded-xl bg-amber-400/10 border border-amber-300/25 p-3 text-xs text-amber-100 leading-relaxed">
            {t('settings.localPrivacy')}
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default App;
