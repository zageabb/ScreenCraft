import React from 'react';

/** Safe design-time placeholder. No network calls or workbook execution. */
export function SpreadsheetObject({props,mode}:{props:Record<string,any>;mode:string}){
 const label=String(props.label||'Spreadsheet').slice(0,120);
 const ref=String(props.workbook_ref||'').slice(0,200);
 const editable=props.mode==='editable';
 return <section className="sc-spreadsheet-preview" aria-label={label} data-spreadsheet-engine="univer">
  <div className="sc-spreadsheet-top"><strong>▦ {label}</strong><span>{editable?'Editable (design only)':'Read-only'} · Univer planned</span></div>
  {props.show_ribbon&&<div className="sc-spreadsheet-ribbon" aria-label="Mock ribbon">File　Home　Insert　Formulas　Data</div>}
  {props.show_formula_bar!==false&&<div className="sc-spreadsheet-formula" aria-label="Mock formula bar"><span>A1</span><span>fx</span><span>Sample data only</span></div>}
  <table className="sc-spreadsheet-grid" aria-label="Example spreadsheet grid">
   <thead><tr><th></th>{['A','B','C','D'].map(c=><th key={c}>{c}</th>)}</tr></thead>
   <tbody>{Array.from({length:5},(_,i)=><tr key={i}><th>{i+1}</th>{Array.from({length:4},(_,j)=><td key={j}>{i===0?['Item','Qty','Unit price','Total'][j]:i===1?['Sample','2','25','=B2*C2'][j]:''}</td>)}</tr>)}</tbody>
  </table>
  {props.show_sheet_tabs!==false&&<div className="sc-spreadsheet-tabs">Sheet1 <span>＋</span></div>}
  <small>{ref?'Workbook reference: '+ref:'No workbook linked'} · {mode==='design'?'Design preview':'Prototype preview'} — live editing, XLSX and Python require SheetBridge.</small>
 </section>
}
