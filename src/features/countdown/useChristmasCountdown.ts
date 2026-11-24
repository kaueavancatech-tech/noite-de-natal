import { useEffect, useState } from 'react';

export interface ChristmasCountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isChristmasDay: boolean;
}

function computeCountdown(): ChristmasCountdownState {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (11 = December)
  const day = now.getDate();

  if (month === 11 && day === 25) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isChristmasDay: true };
  }

  const targetYear = month === 11 && day > 25 ? year + 1 : year;
  const target = new Date(targetYear, 11, 25, 0, 0, 0, 0);
  const diff = Math.max(0, target.getTime() - now.getTime());

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isChristmasDay: false };
}

export function useChristmasCountdown(): ChristmasCountdownState {
  const [state, setState] = useState<ChristmasCountdownState>(() => computeCountdown());

  useEffect(() => {
    const id = window.setInterval(() => {
      setState(computeCountdown());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return state;
}
