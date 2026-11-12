import React,{useState} from 'react';
import type {Dataset,Node} from './model';

type Props={
 dataset?:Dataset;
 values:Record<string,unknown>;
 canEdit:boolean;
 sources:Node[];
 bindings:Record<string,string>;
 onBindingsChange:(bindings:Record<string,string>)=>void;
 onChange:(values:Record<string,unknown>)=>void;
};

/**
 * Dataset-aware values for add_mock_row. Maintain an independent JSON draft so
 * partial (temporarily invalid) edits are not discarded on every keystroke.
 */
export default function ActionRowEditor({dataset,values,canEdit,sources,bindings,onBindingsChange,onChange}:Props){
 const [draft,setDraft]=useState(()=>JSON.stringify(values,null,2));
 const [error,setError]=useState('');
 const update=(next:Record<string,unknown>)=>{
   setDraft(JSON.stringify(next,null,2));
   setError('');
   onChange(next);
 };
 const editJson=(text:string)=>{
   setDraft(text);
   try{
     const parsed:unknown=JSON.parse(text);
     if(parsed===null||typeof parsed!=='object'||Array.isArray(parsed)){
       setError('Enter a JSON object with column names as keys.');
       return;
     }
     setError('');
     onChange(parsed as Record<string,unknown>);
   }catch{
     setError('Incomplete or invalid JSON. Finish editing to apply changes.');
   }
 };
 const columns=dataset?.columns||[];
 return <section className="action-row-editor" aria-label="Add row values">
   <h3>New row values</h3>
   {!dataset?<p role="status">Choose a dataset above to configure the new row.</p>:
     <><p className="muted">These values will be inserted when the button is clicked in Preview. Use the exact table column names.</p>
       <p className="muted">Choose a screen input for each column to capture values entered in Preview. Leave unbound columns using the fixed values below.</p>
       {columns.map(column=><label key={'source-'+column.id}>Input source for {column.id}
         <select aria-label={'Input source for '+column.id} disabled={!canEdit}
           value={bindings[column.id]||''}
           onChange={e=>onBindingsChange({...bindings,[column.id]:e.target.value})}>
           <option value="">Fixed value</option>
           {sources.map(source=><option key={source.id} value={source.id}>{source.props.label||source.props.placeholder||source.type} ({source.type} · {source.id.slice(0,8)})</option>)}
         </select>
       </label>)}
       {columns.map(column=><label key={column.id}>{column.id}
         <input aria-label={'New row '+column.id} disabled={!canEdit}
           value={String(values[column.id]??'')}
           onChange={e=>update({...values,[column.id]:e.target.value})}/>
       </label>)}
       <button type="button" disabled={!canEdit||!(dataset.rows||[]).length}
         onClick={()=>update({...dataset.rows[0]})}>Use first sample row</button>
     </>}
   <label>Advanced: row JSON
     <textarea aria-label="Sample action row (JSON)" disabled={!canEdit}
       value={draft} onChange={e=>editJson(e.target.value)}/>
   </label>
   {error&&<p role="alert">{error}</p>}
 </section>;
}
