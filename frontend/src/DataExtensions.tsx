import React,{useState} from 'react';
import type {Dataset} from './model';

export type DataExtensionProps={
 type:'x-list'|'x-tree'; dataset?:Dataset; rows:Record<string,any>[];
 props:Record<string,any>; selectedIndex?:number|null; onSelect?:(index:number)=>void;
};
const label=(value:unknown)=>value==null?'':String(value);

export function DataExtension({type,dataset,rows,props,selectedIndex,onSelect}:DataExtensionProps){
 const [expanded,setExpanded]=useState<string[]>([]);
 const name=props.label|| (type==='x-tree'?'Tree':'List');
 if(!dataset)return <section className="sc-data-extension"><strong>{name}</strong><p>Choose a dataset in Properties.</p></section>;
 const labelKey=props.label_column||dataset.columns[0]?.id||'';
 const idKey=props.id_column||dataset.columns[0]?.id||'';
 const parentKey=props.parent_column||'parent_id';
 if(type==='x-list')return <section className="sc-data-extension" data-extension-kind="list">
  <strong>{name}</strong>
  <ul className="sc-record-list">{rows.map((record,index)=><li key={index}><button type="button"
   aria-pressed={index===selectedIndex} onClick={()=>onSelect?.(index)}>{label(record[labelKey])||'Unnamed record'}</button></li>)}</ul>
  {!rows.length&&<p>No records.</p>}
 </section>;
 const ids=new Set(rows.map(row=>label(row[idKey])));
 const children=(parent:string|null)=>rows.map((row,index)=>({row,index})).filter(({row})=>{
  const actual=label(row[parentKey]);
  return parent===null?(!actual||actual===label(row[idKey])||!ids.has(actual)):actual===parent;
 });
 const render=(parent:string|null,visited:Set<number>,depth:number):React.ReactNode=>{
  if(depth>=20)return null;
  return children(parent).filter(({index})=>!visited.has(index)).map(({row,index})=>{
   const id=label(row[idKey]);const descendants=children(id).filter(other=>other.index!==index);
   const open=expanded.includes(id);
   return <li key={index}>
    <div className="sc-tree-row">
     {descendants.length?<button type="button" aria-label={'Expand '+id} aria-expanded={open}
       onClick={()=>setExpanded(v=>open?v.filter(x=>x!==id):[...v,id])}>{open?'▾':'▸'}</button>:<span aria-hidden="true">·</span>}
     <button type="button" aria-pressed={index===selectedIndex} onClick={()=>onSelect?.(index)}>
      {label(row[labelKey])||id||'Unnamed node'}
     </button>
    </div>
    {open&&descendants.length>0&&<ul>{render(id,new Set([...visited,index]),depth+1)}</ul>}
   </li>
  });
 };
 return <section className="sc-data-extension" data-extension-kind="tree"><strong>{name}</strong>
  <ul className="sc-tree-root">{render(null,new Set(),0)}</ul>
  {!rows.length&&<p>No records.</p>}
 </section>;
}

export function DataPagination({page,totalPages,onChange,label:caption='Pages'}:{
 page:number;totalPages:number;onChange:(next:number)=>void;label?:string;
}){
 const maximum=Math.max(1,totalPages),current=Math.max(0,Math.min(maximum-1,page));
 return <nav className="sc-pagination" aria-label={caption}>
  <button type="button" disabled={current===0} onClick={()=>onChange(current-1)}>Previous</button>
  <span>Page {current+1} of {maximum}</span>
  <button type="button" disabled={current===maximum-1} onClick={()=>onChange(current+1)}>Next</button>
 </nav>;
}
