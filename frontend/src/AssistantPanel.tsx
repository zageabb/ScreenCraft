import React,{useState,useRef} from 'react';
import type {Document,Node} from './model';
import {catalogueEntries,cloneDoc,isContainer} from './model';
type Proposal={explanation:string;operations:any[]};
function endpoint(path:string){return (location.pathname.startsWith('/apps/screencraft/')?'/apps/screencraft':'')+path}
export function applyProposal(doc:Document,operations:any[]):Document {
 if(!Array.isArray(operations)||operations.length>12)throw Error('Too many AI operations');
 const result=cloneDoc(doc);
 const allowed=new Set(catalogueEntries.map(o=>o.id));
 for(const op of operations){
  if(!op||!['add_node','update_node'].includes(op.op))throw Error('Unsupported AI operation');
  const screen=result.screens.find(s=>s.id===op.screen_id);
  if(!screen)throw Error('AI referenced an unknown screen');
  if(typeof op.id!=='string'||!op.id||op.id.length>120)throw Error('Invalid node ID');
  let node:Node;
  if(op.op==='add_node'){
   if(!allowed.has(op.type)||result.screens.some(s=>s.nodes.some(n=>n.id===op.id)))throw Error('Invalid or duplicated object');
   if(screen.nodes.length>=500)throw Error('Screen object limit exceeded');
   node={id:op.id,type:op.type,parent_id:null,props:{},layout:{x:24,y:24,width:200,height:44}};
   screen.nodes.push(node);
  }else{
   const current=screen.nodes.find(n=>n.id===op.id);
   if(!current)throw Error('Unknown target object');
   node=current;
  }
  if(op.props!==undefined){
   if(!op.props||typeof op.props!=='object'||Array.isArray(op.props))throw Error('Invalid properties');
   node.props={...node.props,...op.props};
  }
  if(op.layout!==undefined){
   if(!op.layout||typeof op.layout!=='object'||Array.isArray(op.layout))throw Error('Invalid layout');
   const next={...node.layout,...op.layout};
   for(const key of ['x','y','width','height'])if(next[key]!==undefined&&(!Number.isFinite(next[key])||Math.abs(next[key])>10000))throw Error('Invalid dimensions');
   if(next.width!==undefined&&next.width<40||next.height!==undefined&&next.height<24)throw Error('Invalid object size');
   node.layout=next;
  }
  if(op.parent_id!==undefined){
   const parent=screen.nodes.find(n=>n.id===op.parent_id);
   if(op.parent_id!==null&&(!parent||!isContainer(parent.type)||parent.id===node.id))throw Error('Invalid container parent');
   node.parent_id=op.parent_id;
  }
  if(op.action!==undefined){
   if(!op.action||typeof op.action!=='object'||Array.isArray(op.action))throw Error('Invalid action');
   if(!['navigate','open_modal','close_modal','alert','add_mock_row','none'].includes(op.action.type))throw Error('Unsupported action');
   node.action=op.action;
  }
 }
 for(const screen of result.screens){
  const map=new Map(screen.nodes.map(n=>[n.id,n]));
  for(const node of screen.nodes){
   const seen=new Set([node.id]);let parent=node.parent_id;
   while(parent){if(seen.has(parent)||!map.has(parent))throw Error('Invalid parent cycle');seen.add(parent);parent=map.get(parent)?.parent_id||null}
   const action=node.action;
   if(!action)continue;
   if(action.type==='navigate'&&action.target_screen&&!result.screens.some(s=>s.id===action.target_screen))throw Error('Missing navigation target');
   if(action.type==='open_modal'&&(!action.target_node||map.get(action.target_node)?.type!=='modal'))throw Error('Missing modal target');
   if(action.type==='add_mock_row'){
    const dataset=result.datasets.find(d=>d.id===action.dataset_id);
    if(!dataset)throw Error('Missing target dataset');
    for(const [column,input] of Object.entries(action.field_bindings||{})){
     if(!dataset.columns.some(c=>c.id===column)||typeof input!=='string'||!map.has(input))throw Error('Missing field binding: '+column);
    }
   }
  }
 }
 return result;
}
export default function AssistantPanel({doc,canEdit,projectId,onApply}:{doc:Document;canEdit:boolean;projectId:string;onApply:(v:Document)=>void}){
 const [open,setOpen]=useState(false),[help,setHelp]=useState(false),[manual,setManual]=useState(''),[prompt,setPrompt]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[proposal,setProposal]=useState<Proposal|null>(null);
 const [pos,setPos]=useState({x:Math.max(12,window.innerWidth-490),y:120});
 const dragging=useRef<{x:number;y:number;left:number;top:number}|null>(null);
 const ask=async()=>{setBusy(true);setError('');setProposal(null);try{
  const response=await fetch(endpoint('/api/ai/propose'),{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({instruction:prompt,document:doc,project_id:projectId})});
  const data=await response.json();if(!response.ok)throw Error(data.error||'AI request failed');
  if(data.operations?.length)applyProposal(doc,data.operations);setProposal(data);
 }catch(err){setError(String(err))}finally{setBusy(false)}};
 const openHelp=async()=>{setHelp(v=>!v);if(!manual){try{const r=await fetch(endpoint('/api/help/catalogue'),{credentials:'same-origin'});const data=await r.json();setManual(data.markdown||'Help unavailable')}catch{setManual('Help unavailable')}}};
 const move=(e:React.PointerEvent)=>{if(!dragging.current)return;setPos({x:Math.max(0,Math.min(window.innerWidth-280,dragging.current.left+e.clientX-dragging.current.x)),y:Math.max(0,Math.min(window.innerHeight-90,dragging.current.top+e.clientY-dragging.current.y))})};
 return <div className="sc-ai-float" style={{position:'fixed',left:pos.x,top:pos.y,zIndex:9999,width:open?420:'auto',maxWidth:'95vw'}}>
  <div className="sc-ai-header" onPointerDown={e=>{if((e.target as HTMLElement).closest('button'))return;dragging.current={x:e.clientX,y:e.clientY,left:pos.x,top:pos.y};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={move} onPointerUp={()=>dragging.current=null} onPointerCancel={()=>dragging.current=null}>
   <strong>✦ ScreenCraft AI</strong><span>Drag to move</span><button onClick={()=>setOpen(v=>!v)} aria-label={open?'Minimise AI assistant':'Open AI assistant'}>{open?'−':'Chat'}</button>
  </div>
  {open&&<section className="sc-ai-body">
    <button onClick={()=>void openHelp()}>{help?'Back to assistant':'Help / full object manual'}</button>
    {help?<pre className="sc-ai-manual">{manual}</pre>:<>
      <p>Ask about objects or connections. AI can propose adding, positioning and wiring objects. Changes require approval.</p>
      <textarea aria-label="AI instruction" rows={4} placeholder="Connect the Name input and Status dropdown to the Add button and table…" value={prompt} onChange={e=>setPrompt(e.target.value)}/>
      <button disabled={!canEdit||busy||!prompt.trim()} onClick={()=>void ask()}>{busy?'Analysing…':'Analyse and propose'}</button>
      {!canEdit&&<small>Read-only demo: AI changes are disabled.</small>}
      {error&&<p role="alert">{error}</p>}
      {proposal&&<div><p>{proposal.explanation}</p><p>{proposal.operations.length} proposed change(s).</p>{proposal.operations.length>0&&<><pre className="sc-ai-plan">{JSON.stringify(proposal.operations,null,2)}</pre><button disabled={!canEdit} onClick={()=>{try{onApply(applyProposal(doc,proposal.operations));setProposal(null);setError('Applied to editor. Review in Preview, then Save.')}catch(e){setError(String(e))}}}>Approve and apply</button><button onClick={()=>setProposal(null)}>Reject</button></>}</div>}
    </>}
   </section>}
 </div>;
}
