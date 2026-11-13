import React,{useEffect,useState} from 'react';
import type {Dataset} from './model';

export type DiagramNode={id:string;label:string;x?:number;y?:number;fields?:string[]};
export type DiagramLink={source:string;target:string;label?:string};
type DiagramProps={kind:'x-diagram'|'x-schema-map';props:Record<string,any>};

const sampleNodes:DiagramNode[]=[
 {id:'source',label:'Source',x:25,y:45,fields:['ID','Name']},
 {id:'target',label:'Target',x:270,y:45,fields:['ID','Source ID']}
];

export function DiagramView({kind,props}:DiagramProps){
 const raw=kind==='x-schema-map'?props.tables:props.nodes;
 const nodes:DiagramNode[]=Array.isArray(raw)&&raw.length?raw:sampleNodes;
 const links:DiagramLink[]=Array.isArray(props.links)?props.links:[{source:'source',target:'target'}];
 const [scale,setScale]=useState(1);
 const [selected,setSelected]=useState<string|null>(null);
 const lookup=new Map(nodes.map(node=>[node.id,node]));
 const left=(n:DiagramNode,i:number)=>Number.isFinite(Number(n.x))?Number(n.x):25+i*220;
 const top=(n:DiagramNode)=>Number.isFinite(Number(n.y))?Number(n.y):45;
 return <div className="sc-advanced-diagram" data-advanced-kind={kind}>
  <div className="sc-diagram-tools"><strong>{props.label||(kind==='x-schema-map'?'Schema map':'Diagram')}</strong>
   <button type="button" aria-label="Zoom out" disabled={scale<=0.5} onClick={()=>setScale(s=>Math.max(.5,s-.25))}>−</button>
   <output aria-label="Zoom level">{Math.round(scale*100)}%</output>
   <button type="button" aria-label="Zoom in" disabled={scale>=2} onClick={()=>setScale(s=>Math.min(2,s+.25))}>+</button>
  </div>
  <div className="sc-diagram-scroller">
   <svg viewBox="0 0 560 290" role="img" aria-label={kind==='x-schema-map'?'Schema relationship map':'Node link diagram'}>
    <g transform={`scale(${scale})`}>
     {links.map((link,i)=>{
      const from=lookup.get(link.source),to=lookup.get(link.target);
      if(!from||!to)return null;
      const start=left(from,nodes.indexOf(from))+140,end=left(to,nodes.indexOf(to));
      const sy=top(from)+27,ey=top(to)+27;
      return <g key={i}><path d={`M ${start} ${sy} L ${(start+end)/2} ${sy} L ${(start+end)/2} ${ey} L ${end} ${ey}`}
       stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"/>
       {link.label&&<text x={(start+end)/2} y={Math.min(sy,ey)-4} textAnchor="middle" fontSize="10">{link.label}</text>}
      </g>
     })}
     {nodes.map((node,i)=>{
      const x=left(node,i),y=top(node),fields=kind==='x-schema-map'?(node.fields||[]):[];
      const h=48+Math.min(fields.length,6)*16;
      return <g key={node.id} role="button" tabIndex={0} aria-label={'Select '+node.label}
       onClick={()=>setSelected(node.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(node.id)}}}>
       <rect x={x} y={y} width="140" height={h} rx="6" fill={selected===node.id?'#d5e8ff':'#f1f5fa'}
        stroke={selected===node.id?'#2772c8':'#8296ae'} strokeWidth="2"/>
       <text x={x+9} y={y+19} fontSize="13" fontWeight="bold" fill="#162c45">{node.label}</text>
       {fields.slice(0,6).map((field,j)=><text key={j} x={x+9} y={y+43+j*16} fontSize="11" fill="#334b65">{field}</text>)}
      </g>;
     })}
    </g>
   </svg>
  </div>
  {selected&&<small>Selected: {lookup.get(selected)?.label||selected}</small>}
 </div>;
}

export function TimelineView({dataset,rows,props,onSelect}:{
 dataset?:Dataset;rows:Record<string,any>[];props:Record<string,any>;onSelect?:(index:number)=>void;
}){
 const dateKey=props.date_column||'Date',titleKey=props.title_column||dataset?.columns[0]?.id||'';
 const ordered=rows.map((row,index)=>({row,index})).sort((a,b)=>String(a.row[dateKey]??'').localeCompare(String(b.row[dateKey]??'')));
 return <section className="sc-advanced-timeline" data-advanced-kind="x-timeline">
  <strong>{props.label||'Timeline'}</strong>
  {!dataset?<p>Choose a dataset in Properties.</p>:<ol>{ordered.map(({row,index})=><li key={index}>
   <button type="button" onClick={()=>onSelect?.(index)}>
    <time>{String(row[dateKey]??'No date')}</time> — {String(row[titleKey]??'Event')}
   </button>
  </li>)}</ol>}
 </section>;
}

export function FilePreviewView({props,assetUrl}:{
 props:Record<string,any>;assetUrl?:string;
}){
 const [filename,setFilename]=useState('');
 const [content,setContent]=useState('');
 const [source,setSource]=useState('');
 const [kind,setKind]=useState<'image'|'text'|'pdf'|'unsupported'|''>('');
 useEffect(()=>()=>{if(source.startsWith('blob:'))URL.revokeObjectURL(source)},[source]);
 async function change(file?:File){
  setContent('');setSource('');setFilename(file?.name||'');setKind('');
  if(!file)return;
  if(file.size>5*1024*1024){setKind('unsupported');setContent('Files over 5 MB are not previewed.');return}
  if(file.type.startsWith('image/')){setKind('image');setSource(URL.createObjectURL(file))}
  else if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){setKind('pdf');setSource(URL.createObjectURL(file))}
  else if(file.type.startsWith('text/')||/\.(txt|md|json|csv|log)$/i.test(file.name)){
   setKind('text');setContent(await file.slice(0,128*1024).text())
  }else{setKind('unsupported');setContent('Preview unavailable for this file type.')}
 }
 return <section className="sc-advanced-file-preview" data-advanced-kind="x-file-preview">
  <strong>{props.label||'File preview'}</strong>
  <input type="file" aria-label="Choose preview file" accept={props.accept||'.txt,.md,.json,.csv,.pdf,image/*'} onChange={e=>void change(e.target.files?.[0])}/>
  {filename&&<small>{filename}</small>}
  {kind==='image'&&<img alt={filename} src={source}/>}
  {kind==='pdf'&&<iframe title="Local PDF preview" sandbox="" src={source}/>}
  {kind==='text'&&<pre>{content}</pre>}
  {kind==='unsupported'&&<p>{content}</p>}
  {!kind&&assetUrl&&<img alt={props.label||'Packaged image preview'} src={assetUrl}/>}
  {!kind&&!assetUrl&&<p>Choose a local file to preview. Nothing is uploaded.</p>}
  <small>Local prototype only — file contents are not saved to .scraft or sent to a server.</small>
 </section>;
}
