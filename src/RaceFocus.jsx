import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Crown, Flame, Swords, Zap } from 'lucide-react';
import { AnimatedScore } from './visuals';
const symbols = {parakrama:Crown,gemunu:Swords,thissa:Flame,vijaya:Zap};
export default function RaceFocus({standings,events}) {
 const [selected,setSelected]=useState(null);
 const house=standings.find(h=>h.id===selected)||standings[0];
 const rank=standings.findIndex(h=>h.id===house.id)+1;
 const Icon=symbols[house.id];
 const wins=events.filter(e=>e.status==='Completed').reduce((total,e)=>total+e.results.filter(r=>r.houseId===house.id&&r.place===1).length,0);
 const gap=standings[0].points-house.points;
 return <section className="race-focus container" aria-labelledby="race-focus-title"><div className="focus-intro"><span className="studio-eyebrow">FOUR COLOURS. ONE FINISH LINE.</span><h2 id="race-focus-title">Find your house.<br/><em>Feel the race.</em></h2><p>Choose a house. Follow every point,<br/>every finish, every step to the top.</p><div className="focus-house-buttons" role="group" aria-label="Choose a house to explore">{standings.map(h=><button key={h.id} style={{'--house':h.color}} aria-pressed={house.id===h.id} onClick={()=>setSelected(h.id)}><i/>{h.name}</button>)}</div></div><div className="focus-pass" style={{'--focus':house.color}}><div className="focus-pass-top"><span>HOUSE SPOTLIGHT</span><span>BCG — 27</span></div><div className="focus-identity" key={house.id}><div className="focus-symbol"><Icon size={48}/></div><div><span>THE {rank===1?'PACE SETTERS':'CHALLENGERS'}</span><h3>{house.name}</h3><p>{house.motto}</p></div><strong>0{rank}</strong></div><div className="focus-stats"><div><strong><AnimatedScore value={house.points}/></strong><span>TOTAL POINTS</span></div><div><strong>{wins}</strong><span>FIRST-PLACE FINISHES</span></div><div><strong>{gap===0?'—':gap}</strong><span>{gap===0?'AT THE FRONT':'POINTS TO THE LEAD'}</span></div></div><div className="focus-lanes" aria-label="House score comparison">{standings.map(h=><div key={h.id} className={h.id===house.id?'selected':''}><span>{h.name}</span><div><i style={{width:`${h.points/Math.max(standings[0].points,1)*100}%`,background:h.color}}/></div><b>{h.points}</b></div>)}</div><Link to="/standings">Explore the full standings <ArrowUpRight size={17}/></Link></div></section>;
}
