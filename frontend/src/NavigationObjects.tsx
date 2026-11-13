import React,{useState} from 'react';
import type {Document} from './model';

type Props={
 doc:Document;currentScreenId:string;history:string[];props:Record<string,any>;
 onNavigate:(screenId:string)=>void;mode:string;children?:React.ReactNode;
};
const valid=(doc:Document,id:string)=>doc.screens.some(s=>s.id===id);
export function MenuObject({doc,currentScreenId,props,onNavigate,mode,children}:Props){
 const [expanded,setExpanded]=useState<string[]>([]);
 const items=props.use_shared!==false&&doc.shared_navigation?.items?.length
  ?doc.shared_navigation.items:props.items?.length?props.items:doc.screen_order.map(id=>({id:'menu-'+id,label:doc.screens.find(s=>s.id===id)?.name||id,target_screen:id}));
 const eligible=items.filter((item:any)=>(!item.target_screen||valid(doc,item.target_screen))&&!item.hidden_on?.includes(currentScreenId));
 const ids=new Set(eligible.map((item:any)=>item.id));
 const make=(item:any,ancestors:Set<string>):React.ReactNode=>{
  if(ancestors.has(item.id))return null;
  const next=new Set([...ancestors,item.id]),nested=eligible.filter((candidate:any)=>candidate.parent_id===item.id);
  const open=expanded.includes(item.id);
  return <li key={item.id}><div className="sc-menu-row">
   <button type="button" aria-current={item.target_screen===currentScreenId?'page':undefined}
     disabled={mode!=='preview'||!item.target_screen}
     onClick={()=>item.target_screen&&onNavigate(item.target_screen)}>{item.icon||''} {item.label||item.target_screen||'Group'}</button>
   {nested.length>0&&<button type="button" aria-label={'Expand '+item.label} aria-expanded={open}
     disabled={mode!=='preview'} onClick={()=>setExpanded(v=>open?v.filter(id=>id!==item.id):[...v,item.id])}>{open?'▾':'▸'}</button>}
   </div>{open&&nested.length>0&&<ul>{nested.map((node:any)=>make(node,next))}</ul>}
  </li>;
 };
 return <nav className="sc-local-menu" aria-label={props.label||'Menu'}>
  <strong>{props.label||'Menu'}</strong>
  <ul>{eligible.filter((item:any)=>!item.parent_id||!ids.has(item.parent_id)).map((item:any)=>make(item,new Set()))}</ul>
  {children}
 </nav>;
}
export function BreadcrumbsObject({doc,currentScreenId,history,props,onNavigate,mode,children}:Props){
 const path=Array.from(new Set([...history,currentScreenId])).filter(id=>valid(doc,id));
 return <nav className="sc-breadcrumbs" aria-label={props.label||'Breadcrumbs'}>
  {path.map((id,i)=><React.Fragment key={id}>{i>0&&<span aria-hidden="true"> / </span>}
   <button type="button" aria-current={id===currentScreenId?'page':undefined}
     disabled={mode!=='preview'||id===currentScreenId}
     onClick={()=>onNavigate(id)}>{doc.screens.find(s=>s.id===id)?.name||id}</button>
  </React.Fragment>)}
  {children}
 </nav>;
}
