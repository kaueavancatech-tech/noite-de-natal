export type LanguageCode = 'pt-BR' | 'es' | 'en';
export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  volume: number; // 0 to 1
  sfxEnabled: boolean;
  particlesEnabled: boolean;
  reducedMotion: boolean;
}

export interface WishLetter {
  id: string;
  wish: string;
  reply: string;
  createdAt: string;
}

export interface TrackItem {
  id: string;
  titleKey: string;
  src: string;
  melodyNotes: number[];
}

export interface GiftSurprise {
  id: number;
  color: string;
  ribbon: string;
  messageKey: string;
}
