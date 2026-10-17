import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function ArenaEffects() {
  const canvas = useRef(null);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('bcg-motion-paused') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'playing';
    window.dispatchEvent(new Event('bcg-motion-change'));
    try { localStorage.setItem('bcg-motion-paused', String(paused)); } catch { /* Optional preference. */ }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const surface = canvas.current;
    const context = surface.getContext('2d');
    if (!context) return;
    let frame = 0, width = 0, height = 0, last = 0, particles = [];
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      surface.width = width * ratio; surface.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: width < 700 ? 18 : 42 }, () => ({ x: Math.random() * width, y: Math.random() * height, size: .5 + Math.random() * 1.4, speed: 5 + Math.random() * 15 }));
    };
    const tick = now => {
      const dt = Math.min((now - last) / 1000, .04); last = now;
      context.clearRect(0, 0, width, height);
      context.fillStyle = getComputedStyle(document.querySelector('.app')).getPropertyValue('--accent').trim() || '#e9df46';
      for (const p of particles) {
        p.y -= p.speed * dt; if (p.y < -5) p.y = height + 5;
        context.globalAlpha = .15 + p.size * .14;
        context.beginPath(); context.arc(p.x, p.y, p.size, 0, Math.PI * 2); context.fill();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); context.clearRect(0, 0, width, height);
      if (!paused && !reduced.matches && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(tick); }
    };
    resize(); sync();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync); };
  }, [paused]);
  return <><canvas ref={canvas} className="arena-particles" aria-hidden="true"/><button className="motion-toggle" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume animations' : 'Pause animations'} aria-pressed={paused}>{paused ? <Play size={14}/> : <Pause size={14}/>}<span>{paused ? 'Motion off' : 'Motion on'}</span></button></>;
}
