import React from 'react';
import type {Dataset} from './model';

type Props={dataset:Dataset;canEdit:boolean;onChange:(next:Dataset)=>void};
const valueToText=(value:unknown)=>value===null||value===undefined?'':String(value);

export default function TableDataEditor({dataset,canEdit,onChange}:Props){
 const columns=dataset.columns||[];
 const rows=dataset.rows||[];
 const rename=(index:number,name:string)=>{
   if(!name.trim()||columns.some((c,i)=>i!==index&&c.id===name))return;
   const previous=columns[index].id;
   onChange({...dataset,
     columns:columns.map((c,i)=>i===index?{...c,id:name}:c),
     rows:rows.map(row=>{
       const next={...row};
       next[name]=next[previous]??'';
       if(name!==previous)delete next[previous];
       return next;
     })
   });
 };
 const setCell=(rowIndex:number,column:string,value:string)=>onChange({...dataset,
   rows:rows.map((row,i)=>i===rowIndex?{...row,[column]:value}:row)
 });
 const addColumn=()=>{
   let candidate='Column '+(columns.length+1);
   let number=columns.length+1;
   while(columns.some(c=>c.id===candidate))candidate='Column '+(++number);
   onChange({...dataset,columns:[...columns,{id:candidate,type:'text'}],
     rows:rows.map(row=>({...row,[candidate]:''}))});
 };
 const deleteColumn=(index:number)=>{
   if(columns.length<=1)return;
   const key=columns[index].id;
   onChange({...dataset,columns:columns.filter((_,i)=>i!==index),
     rows:rows.map(row=>{const next={...row};delete next[key];return next})});
 };
 const addRow=()=>onChange({...dataset,rows:[...rows,Object.fromEntries(columns.map(c=>[c.id,'']))]});
 const deleteRow=(index:number)=>onChange({...dataset,rows:rows.filter((_,i)=>i!==index)});
 return <section className="dataset-editor" aria-label="Table sample data">
   <h3>Table sample data</h3>
   <p className="muted">Edit the columns and sample rows shown in Design and Preview. Save to include them in the .scraft document.</p>
   <div className="dataset-columns">
     {columns.map((column,i)=><div className="dataset-column" key={i}>
       <label>Column {i+1}
         <input aria-label={'Column '+(i+1)+' name'} value={column.id}
           disabled={!canEdit} onChange={e=>rename(i,e.target.value)}/>
       </label>
       <button type="button" aria-label={'Remove column '+column.id}
         disabled={!canEdit||columns.length<=1} onClick={()=>deleteColumn(i)}>×</button>
     </div>)}
   </div>
   <button type="button" disabled={!canEdit} onClick={addColumn}>+ Column</button>
   <div className="dataset-rows">
     {rows.map((row,index)=><div className="dataset-row" key={index}>
       <strong>Row {index+1}</strong>
       {columns.map(column=><label key={column.id}>{column.id}
         <input aria-label={'Row '+(index+1)+' '+column.id}
           disabled={!canEdit} value={valueToText(row[column.id])}
           onChange={e=>setCell(index,column.id,e.target.value)}/>
       </label>)}
       <button type="button" disabled={!canEdit} onClick={()=>deleteRow(index)}>Remove row</button>
     </div>)}
     {rows.length===0&&<p className="muted">No sample rows. Add a row to preview data.</p>}
   </div>
   <button type="button" disabled={!canEdit} onClick={addRow}>+ Sample row</button>
 </section>;
}
