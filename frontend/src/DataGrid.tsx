import React,{useMemo,useState} from 'react';
import type {Dataset} from './model';

export type DataTableOptions={
 searchable?:boolean; sortable?:boolean; selectable?:boolean;
 filter_column?:string; filter_value?:string; page_size?:number;
};
type Props={
 dataset:Dataset; rows:Record<string,unknown>[]; options:DataTableOptions;
 editable:boolean; canMutate:boolean; onRowsChange:(rows:Record<string,unknown>[])=>void;
 activeIndex?:number|null; onSelectRow?:(index:number)=>void;
};

function display(value:unknown){return value===null||value===undefined?'':String(value)}
function compare(a:unknown,b:unknown){
 const left=display(a),right=display(b);
 const na=Number(left),nb=Number(right);
 if(left.trim()!==''&&right.trim()!==''&&Number.isFinite(na)&&Number.isFinite(nb))return na-nb;
 return left.localeCompare(right,undefined,{numeric:true,sensitivity:'base'});
}

/** Preview-only data grid; source indexes remain stable across search, sort, and paging. */
export default function DataGrid({dataset,rows,options,editable,canMutate,onRowsChange,activeIndex,onSelectRow}:Props){
 const [search,setSearch]=useState('');
 const [sort,setSort]=useState<{key:string;direction:1|-1}|null>(null);
 const [selected,setSelected]=useState<number[]>([]);
 const [page,setPage]=useState(0);
 const columns=dataset.columns||[];
 const pageSize=Math.max(0,Math.min(100,Number(options.page_size)||0));
 const filtered=useMemo(()=>{
  let items=rows.map((row,index)=>({row,index}));
  if(options.filter_column&&options.filter_value){
   const term=String(options.filter_value).toLocaleLowerCase();
   items=items.filter(({row})=>display(row[options.filter_column!]).toLocaleLowerCase().includes(term));
  }
  if(search.trim())items=items.filter(({row})=>columns.some(c=>display(row[c.id]).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())));
  if(sort)items.sort((a,b)=>compare(a.row[sort.key],b.row[sort.key])*sort.direction||a.index-b.index);
  return items;
 },[rows,columns,search,sort,options.filter_column,options.filter_value]);
 const totalPages=pageSize?Math.max(1,Math.ceil(filtered.length/pageSize)):1;
 const currentPage=Math.min(page,totalPages-1);
 const visible=pageSize?filtered.slice(currentPage*pageSize,(currentPage+1)*pageSize):filtered;
 const selectedIndices=selected.filter(index=>index>=0&&index<rows.length);
 const toggle=(index:number)=>setSelected(current=>current.includes(index)?current.filter(v=>v!==index):[...current,index]);
 const update=(index:number,column:string,value:string)=>{
  if(!canMutate)return;
  onRowsChange(rows.map((r,i)=>i===index?{...r,[column]:value}:r));
 };
 const add=()=>{
  if(!canMutate||rows.length>=1000)return;
  onRowsChange([...rows,Object.fromEntries(columns.map(c=>[c.id,'']))]);
  setPage(totalPages-1);
 };
 const remove=()=>{
  if(!canMutate||!selectedIndices.length)return;
  const ids=new Set(selectedIndices);
  onRowsChange(rows.filter((_,i)=>!ids.has(i)));
  if(activeIndex!=null&&ids.has(activeIndex))onSelectRow?.(-1);
  setSelected([]);
 };
 return <div className="data-grid" data-grid-kind={editable?'editable':'table'}>
  {options.searchable&&<label className="data-grid-search">Search records
   <input aria-label="Search records" value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}}/>
  </label>}
  {editable&&<div className="data-grid-actions">
   <button type="button" disabled={!canMutate||rows.length>=1000} onClick={add}>+ Row</button>
   <button type="button" disabled={!canMutate||!selectedIndices.length} onClick={remove}>Delete selected</button>
   {!canMutate&&<span className="muted">Preview editing is available for seed-reset datasets only.</span>}
  </div>}
  <div className="table-scroll"><table>
   <thead><tr>{(options.selectable||editable)&&<th>Choose</th>}
    {columns.map(column=><th key={column.id}>{options.sortable?
     <button type="button" aria-label={'Sort '+column.id} onClick={()=>{setSort(v=>v?.key===column.id?{key:column.id,direction:v.direction===1?-1:1}:{key:column.id,direction:1});setPage(0)}}>{column.id}{sort?.key===column.id?(sort.direction===1?' ▲':' ▼'):''}</button>
     :column.id}</th>)}</tr></thead>
   <tbody>{visible.map(({row,index})=><tr key={index} data-row-index={index} className={activeIndex===index||selectedIndices.includes(index)?'selected-row':''} onClick={()=>onSelectRow?.(index)}>
    {(options.selectable||editable)&&<td><input type="checkbox" aria-label={'Select row '+(index+1)} checked={selectedIndices.includes(index)} onChange={()=>{toggle(index);onSelectRow?.(index)}}/></td>}
    {columns.map(column=><td key={column.id}>{editable?
      <input aria-label={'Edit row '+(index+1)+' '+column.id} value={display(row[column.id])}
       disabled={!canMutate} onChange={e=>update(index,column.id,e.target.value)}/>
      :display(row[column.id])}</td>)}
   </tr>)}</tbody>
  </table></div>
  {!visible.length&&<p className="muted">No matching records</p>}
  {pageSize>0&&<div className="data-grid-pages">
   <button type="button" aria-label="Previous page" disabled={currentPage===0} onClick={()=>setPage(v=>Math.max(0,v-1))}>Previous</button>
   <span>Page {currentPage+1} of {totalPages}</span>
   <button type="button" aria-label="Next page" disabled={currentPage>=totalPages-1} onClick={()=>setPage(v=>v+1)}>Next</button>
  </div>}
  <small className="muted">{filtered.length} of {rows.length} record(s)</small>
 </div>;
}
