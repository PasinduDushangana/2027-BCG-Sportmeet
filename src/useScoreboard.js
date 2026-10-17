import { useCallback, useEffect, useRef, useState } from 'react';
import { initialPublished, readPublishedScores, validatePublished } from './score-service';
const CACHE_KEY = 'bcg-public-scoreboard-v1';
function cachedScores() {
  try { return validatePublished(JSON.parse(localStorage.getItem(CACHE_KEY))); } catch { return initialPublished; }
}
export default function useScoreboard() {
  const [published,setPublished] = useState(cachedScores);
  const [syncError,setSyncError] = useState(false);
  const [loading,setLoading] = useState(true);
  const running=useRef(null);
  const latest=useRef(published);
  const refresh = useCallback(() => {
    if (running.current) return running.current.promise;
    const controller=new AbortController();
    const task={controller,promise:null};
    running.current=task;
    task.promise=readPublishedScores(controller.signal).then(next=>{
      if(controller.signal.aborted)return null;
      const effective=(Date.parse(next.publishedAt)||0) >= (Date.parse(latest.current.publishedAt)||0) ? next : latest.current;
      latest.current=effective;
      try {localStorage.setItem(CACHE_KEY,JSON.stringify(effective));} catch { /* Network scores remain available without a cache. */ }
      setPublished(effective);
      setSyncError(false);return effective;
    }).catch(()=>{if(!controller.signal.aborted)setSyncError(true);return null;}).finally(()=>{
      if(!controller.signal.aborted)setLoading(false);
      if(running.current===task)running.current=null;
    });
    return task.promise;
  },[]);
  useEffect(()=>{
    refresh();
    const poll=setInterval(()=>{if(document.visibilityState==='visible')refresh()},20000);
    const wake=()=>{if(document.visibilityState==='visible')refresh()};
    window.addEventListener('focus',wake);document.addEventListener('visibilitychange',wake);
    return()=>{clearInterval(poll);window.removeEventListener('focus',wake);document.removeEventListener('visibilitychange',wake);running.current?.controller.abort();running.current=null;};
  },[refresh]);
  return {published,syncError,loading,refresh};
}
