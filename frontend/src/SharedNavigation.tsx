import React,{useState} from 'react';
import type {SharedNavigation as NavModel,SharedNavItem} from './model';

type Props={navigation:NavModel;active:string;onNavigate:(id:string)=>void;validScreens:Set<string>};
export function visibleItems(navigation:NavModel,active:string,validScreens:Set<string>){
 return navigation.items.filter(item=>item.target_screen&&validScreens.has(item.target_screen)&&!item.hidden_on?.includes(active));
}
export default function SharedNavigation({navigation,active,onNavigate,validScreens}:Props){
 const [collapsed,setCollapsed]=useState(Boolean(navigation.initial_collapsed));
 const [mobileOpen,setMobileOpen]=useState(!navigation.mobile_collapsed);
 const [expandedGroups,setExpandedGroups]=useState<string[]>([]);
 const items=visibleItems(navigation,active,validScreens);
 const available=new Set(items.map(item=>item.id));
 const roots=items.filter(item=>!item.parent_id||!available.has(item.parent_id));
 function itemView(item:SharedNavItem,ancestors=new Set<string>()):React.ReactNode{
  if(ancestors.has(item.id))return null;
  const children=items.filter(entry=>entry.parent_id===item.id);
  const open=expandedGroups.includes(item.id);
  const next=new Set([...ancestors,item.id]);
  return <div className="shared-nav-entry" key={item.id}>
   <div className="shared-nav-entry-row">
    <button type="button" className={item.target_screen===active?'is-active':''}
      aria-current={item.target_screen===active?'page':undefined}
      onClick={()=>{if(item.target_screen){onNavigate(item.target_screen);setMobileOpen(false)}}}
      title={item.label}>{!collapsed&&<span>{item.icon?item.icon+' ':''}{item.label}</span>}{collapsed&&<span aria-hidden="true">{item.icon||'•'}</span>}</button>
    {!!children.length&&!collapsed&&<button type="button" aria-label={'Expand '+item.label}
      aria-expanded={open} onClick={()=>setExpandedGroups(v=>open?v.filter(id=>id!==item.id):[...v,item.id])}>{open?'▾':'▸'}</button>}
   </div>
   {open&&!collapsed&&children.length>0&&<div className="shared-nav-children">{children.map(child=>itemView(child,next))}</div>}
  </div>;
 }
 return <nav className={'shared-app-nav nav-'+navigation.position+(collapsed?' is-collapsed':'')+(mobileOpen?' mobile-open':'')}
   aria-label="Application navigation" data-nav-position={navigation.position}>
   <div className="shared-nav-controls">
    {navigation.collapsible&&<button type="button" aria-label="Toggle shared navigation"
      aria-expanded={!collapsed} onClick={()=>setCollapsed(v=>!v)}>{collapsed?'☰':'◀'}</button>}
    <button type="button" className="shared-mobile-toggle" aria-label="Toggle mobile navigation"
      aria-expanded={mobileOpen} onClick={()=>setMobileOpen(v=>!v)}>☰ Menu</button>
   </div>
   <div className="shared-nav-items">{roots.map(item=>itemView(item))}</div>
 </nav>;
}
