import React from 'react';
import type {Dataset} from './model';

type Props={
 dataset?:Dataset; rows:Record<string,unknown>[]; selectedIndex:number|null;
 editable:boolean; canMutate:boolean; label?:string;
 onRowsChange:(rows:Record<string,unknown>[])=>void;
};
const display=(value:unknown)=>value==null?'':String(value);

/** The detail panel never stores its own record copy: it edits a selected source row. */
export default function RecordDetail({dataset,rows,selectedIndex,editable,canMutate,label,onRowsChange}:Props){
 const selected=selectedIndex!==null&&selectedIndex>=0&&selectedIndex<rows.length?selectedIndex:null;
 const record=selected===null?null:rows[selected];
 return <section className="record-detail" data-record-detail="true">
  <h4>{label||'Record details'}</h4>
  {!dataset?<p role="status">Choose a dataset in Properties.</p>:
   record===null?<p role="status">Select a row in the linked table or grid.</p>:<>
    {dataset.columns.map(column=><label key={column.id} className="record-detail-field">
     <span>{column.id}</span>
     {editable?<input aria-label={'Detail '+column.id} value={display(record[column.id])}
       disabled={!canMutate} onChange={event=>{
        if(!canMutate||selected===null)return;
        const value=event.target.value;
        onRowsChange(rows.map((row,index)=>index===selected?{...row,[column.id]:value}:row));
       }}/>:
       <output aria-label={'Detail '+column.id}>{display(record[column.id])}</output>}
    </label>)}
    <small className="muted">{editable?(canMutate?'Changes update the selected mock record.':'Editing requires a seed-reset dataset.'):'Read-only detail view.'}</small>
   </>}
 </section>;
}
