import { useState } from 'react';
import { ArrowUpRight, Check, CloudUpload, Download, Globe2, KeyRound, LoaderCircle, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { publishScores, REPOSITORY } from './score-service';

export default function ScorePublisher({ draft, published, syncError, onPublished, onLoadPublished, onRefresh }) {
  const [open,setOpen] = useState(false);
  const [token,setToken] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [failed,setFailed] = useState(false);
  const [pending,setPending] = useState(null);
  const confirmed = pending && published.revision === pending;
  const changed = JSON.stringify(draft.events) !== JSON.stringify(published.events) || JSON.stringify(draft.adjustments) !== JSON.stringify(published.adjustments);
  async function submit(e) {
    e.preventDefault(); setBusy(true);setMessage('');setFailed(false);setPending(null);
    try {
      const document = await publishScores(draft,token);
      setToken('');setOpen(false);setPending(document.revision);
      onPublished(document);onRefresh();
      setMessage('Scores submitted. Waiting for the public scoreboard to refresh.');
    } catch(error) {
      setFailed(true);
      setMessage(error.message === 'Failed to fetch' ? 'Unable to reach GitHub. Check your connection and try again. Your draft is safe.' : error.message);
    } finally {setBusy(false);}
  }
  function backup() {
    const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}));link.download='bcg-score-draft.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  }
  return <section className="publish-panel" aria-label="Score publishing">
    <div className="publish-summary"><span className="publish-icon"><Globe2 size={25}/></span><div><span className="publish-eyebrow">ONE SCOREBOARD. EVERYONE CONNECTED.</span><h2>{changed?'Your draft is ready for the spotlight.':'The scoreboard is up to date.'}</h2><p>Changes stay private until you publish. Visitors check for new scores every 20 seconds.</p></div><span className={changed?'draft-pill':'draft-pill synced'}>{changed?'UNPUBLISHED CHANGES':published.isSample?'SAMPLE SCORES':'PUBLISHED'}</span></div>
    <div className="publish-toolbar"><div><button className="quiet-button" onClick={backup}><Download size={15}/> Back up draft</button><button className="quiet-button" disabled={busy} onClick={()=>{if(window.confirm('Replace this draft with the latest published scores? Back up your draft first if you want to keep it.'))onLoadPublished();}}><RefreshCw size={15}/> Load published scores</button></div><button className="button button-lime publish-trigger" onClick={()=>{setOpen(!open);setMessage('');setToken('')}} disabled={busy}><CloudUpload size={18}/>{open?'Close publishing':'Publish scores'}<ArrowUpRight size={17}/></button></div>
    {open&&<form className="publish-form" onSubmit={submit}><div className="publish-auth-copy"><ShieldCheck size={23}/><div><h3>Only authorised editors can publish.</h3><p>Use a GitHub fine-grained token for <strong>{REPOSITORY}</strong> with <strong>Contents: Read and write</strong>. The token is sent only to GitHub and is never saved in this browser.</p><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Create a publishing token <ArrowUpRight size={13}/></a></div></div><label className="publish-token-label">GitHub publishing token<div><KeyRound size={17}/><input type="password" value={token} onChange={e=>setToken(e.target.value)} autoComplete="off" spellCheck="false" placeholder="Enter your GitHub token" required disabled={busy}/></div></label><button className="button button-lime" type="submit" disabled={busy||!token.trim()}>{busy?<LoaderCircle className="spin" size={17}/>:<CloudUpload size={17}/>} {busy?'Publishing…':'Publish for everyone'}</button></form>}
    {(message||confirmed)&&<div className={failed?'publish-feedback error':'publish-feedback'} role="status">{failed?<X size={17}/>:<Check size={17}/>}<span>{confirmed?'Confirmed: the public scoreboard is now showing these scores.':message}</span></div>}
    {syncError&&<p className="sync-error">The public scoreboard could not be refreshed. Your draft remains saved. <button onClick={onRefresh}>Try again</button></p>}
  </section>;
}
