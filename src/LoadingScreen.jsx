import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { houses } from './data';

export default function LoadingScreen({ loading, onComplete }) {
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minimum = setTimeout(() => setMinimumElapsed(true), reduced ? 0 : 900);
    const deadline = setTimeout(() => setLeaving(true), 4000);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = e => { if (e.key === 'Escape') setLeaving(true); };
    window.addEventListener('keydown', escape);
    return () => {
      clearTimeout(minimum); clearTimeout(deadline);
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => { if (minimumElapsed && !loading) setLeaving(true); }, [minimumElapsed, loading]);
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => complete.current(), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420);
    return () => clearTimeout(timer);
  }, [leaving]);
  return <section className={`meet-loader${leaving ? ' is-leaving' : ''}`} aria-label="Loading the sports meet">
    <div className="loader-top"><span>BCG / GAMPAHA</span><span>SPORTS MEET 2027</span></div>
    <div className="loader-centre"><div className="loader-emblem" aria-hidden="true"><i/><i/><i/><Trophy size={44}/></div><span className="loader-eyebrow">THE COLOURS. THE COURAGE. THE COLLEGE.</span><h1>Greatness starts<br/>at the <em>line.</em></h1><div className="loader-lanes" aria-hidden="true">{houses.map((h,i)=><div key={h.id} style={{'--lane':h.color,'--lane-delay':`${i*-.3}s`}}><span>0{i+1}</span><i/></div>)}</div><p role="status">{leaving ? 'Welcome to the championship.' : loading ? 'Connecting to the shared scoreboard…' : 'The scoreboard is ready.'}</p><button onClick={() => setLeaving(true)}>Enter the meet <ArrowRight size={16}/></button></div>
    <div className="loader-bottom">{houses.map(h=><span key={h.id}><i style={{background:h.color}}/>{h.name}</span>)}</div>
  </section>;
}
