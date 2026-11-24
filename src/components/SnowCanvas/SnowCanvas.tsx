import React, { useEffect, useRef } from 'react';
import { ThemeMode } from '../../types/christmas';

interface SnowCanvasProps {
  enabled: boolean;
  reducedMotion: boolean;
  partyLights: boolean;
  theme: ThemeMode;
  shootingStarTrigger: number;
}

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speedY: number;
  drift: number;
  alpha: number;
  tint: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export const SnowCanvas: React.FC<SnowCanvasProps> = ({
  enabled,
  reducedMotion,
  partyLights,
  theme,
  shootingStarTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const configRef = useRef({ enabled, reducedMotion, partyLights, theme });

  useEffect(() => {
    configRef.current = { enabled, reducedMotion, partyLights, theme };
  }, [enabled, reducedMotion, partyLights, theme]);

  useEffect(() => {
    if (shootingStarTrigger <= 0 || configRef.current.reducedMotion) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    shootingStarsRef.current.push({
      x: w * (0.15 + Math.random() * 0.45),
      y: h * (0.06 + Math.random() * 0.2),
      vx: 9 + Math.random() * 4,
      vy: 3.2 + Math.random() * 2,
      life: 0,
      maxLife: 46,
    });
  }, [shootingStarTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const count = isMobile ? 65 : 130;

    const partyColors = ['#fde68a', '#fca5a5', '#93c5fd', '#86efac', '#ffffff'];

    const flakes: Snowflake[] = Array.from({ length: count }, (_, i) => {
      const layer = i % 3;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: layer === 0 ? 1.2 + Math.random() : layer === 1 ? 2.1 + Math.random() : 3.2 + Math.random() * 1.4,
        speedY: layer === 0 ? 0.35 : layer === 1 ? 0.75 : 1.25,
        drift: (Math.random() - 0.5) * 0.6,
        alpha: layer === 0 ? 0.35 : layer === 1 ? 0.65 : 0.9,
        tint: partyColors[i % partyColors.length],
      };
    });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const { enabled: isOn, reducedMotion: isReduced, partyLights: isParty, theme: currentTheme } = configRef.current;

      if (isOn) {
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          if (!isReduced) {
            f.y += f.speedY;
            f.x += f.drift + Math.sin(f.y * 0.012) * 0.25;
            if (f.y > height + 8) {
              f.y = -8;
              f.x = Math.random() * width;
            }
            if (f.x > width + 8) f.x = -8;
            if (f.x < -8) f.x = width + 8;
          }

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          if (isParty && i % 4 === 0) {
            ctx.fillStyle = f.tint;
          } else {
            ctx.fillStyle = currentTheme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(226, 242, 255, 0.88)';
          }
          ctx.globalAlpha = f.alpha;
          ctx.fill();
        }
      }

      // Estrelas cadentes
      const stars = shootingStarsRef.current;
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life += 1;

        const progress = s.life / s.maxLife;
        const opacity = Math.sin(progress * Math.PI);

        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
        grad.addColorStop(0, `rgba(254, 240, 138, ${opacity})`);
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.stroke();

        if (s.life >= s.maxLife) {
          stars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10"
    />
  );
};
