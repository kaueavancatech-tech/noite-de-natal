import { useCallback, useEffect, useRef, useState } from 'react';

const SLEIGH_INTERVAL_SEC = 12;

export function useTimedEvents(reducedMotion: boolean) {
  const [sleighSecondsLeft, setSleighSecondsLeft] = useState<number>(9);
  const [isSleighFlying, setIsSleighFlying] = useState<boolean>(false);
  const [shootingStarTrigger, setShootingStarTrigger] = useState<number>(0);
  const flyingLockRef = useRef<boolean>(false);

  const launchSleigh = useCallback(() => {
    if (flyingLockRef.current) return;
    flyingLockRef.current = true;
    setIsSleighFlying(true);

    const flightDuration = reducedMotion ? 2200 : 5600;
    window.setTimeout(() => {
      setIsSleighFlying(false);
      flyingLockRef.current = false;
      setSleighSecondsLeft(SLEIGH_INTERVAL_SEC);
    }, flightDuration);
  }, [reducedMotion]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (flyingLockRef.current) return;
      setSleighSecondsLeft((prev) => {
        if (prev <= 1) {
          launchSleigh();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [launchSleigh]);

  useEffect(() => {
    if (reducedMotion) return;
    const starTimer = window.setInterval(() => {
      setShootingStarTrigger((n) => n + 1);
    }, 9000);
    return () => window.clearInterval(starTimer);
  }, [reducedMotion]);

  const triggerShootingStar = useCallback(() => {
    setShootingStarTrigger((n) => n + 1);
  }, []);

  return {
    sleighSecondsLeft,
    isSleighFlying,
    launchSleigh,
    shootingStarTrigger,
    triggerShootingStar,
  };
}
