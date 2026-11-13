import React,{useState,useRef,useEffect} from 'react';
import './prototype-theme.css';
import{blank,palette,newNode,updateNode,insertNode,cloneDoc,catalogueEntries,catalogueInfo,isContainer,isSupported,removeNodeTree,reparentNode,reorderScreen,removeScreen,cloneSubtree,COLLAPSIBLE_TYPES,defaultSharedNavigation}from './model';import type{Document,Node,Screen,Action}from './model';
import TableDataEditor from './TableDataEditor';
import DataGrid from './DataGrid';
import {DataExtension,DataPagination} from './DataExtensions';
import RecordDetail from './RecordDetail';
import SharedNavigation from './SharedNavigation';
import {MenuObject,BreadcrumbsObject} from './NavigationObjects';
import {DiagramView,TimelineView,FilePreviewView} from './AdvancedObjects';
import {DataChart,MetricCard} from './Metrics';
import ActionRowEditor from './ActionRowEditor';
import {resolveActionRow} from './actionBindings';
import {validateBoundInputs} from './fieldValidation';
import {withTableDataset,updateDataset} from './datasets';
type Project={id:string;name:string;revision:number;role:string};
function apiUrl(path:string){const prefix=location.pathname.startsWith('/apps/screencraft/')?'/apps/screencraft':'';return prefix+path}
async function request(path:string,options:RequestInit={}) {
 const url=apiUrl(path);
 const r=await fetch(url,{credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json',...options.headers},...options});
 const type=r.headers.get('content-type')||'';
 if(!type.toLowerCase().includes('application/json')){
   // A proxy error, authentication redirect, wrong subpath or SPA fallback can return HTML.
   // Do not print the HTML response: it may contain sensitive infrastructure details.
   const note=r.redirected?' (redirected to '+new URL(r.url).pathname+')':'';
   throw new Error('API '+(options.method||'GET')+' '+url+' returned HTTP '+r.status+' ('+(type||'no content type')+') instead of JSON'+note+'. Check the reverse-proxy route and server logs.');
 }
 let body:any;
 try{body=await r.json()}catch{throw new Error('API '+(options.method||'GET')+' '+url+' returned invalid JSON (HTTP '+r.status+').')}
 if(!r.ok)throw new Error('API '+(options.method||'GET')+' '+url+' failed ('+r.status+'): '+(body?.error||'Request failed'));
 return body;
}
function CanvasNode({node,mode,selected,onPick,onMove,onResize,onAction,onInputChange,inputValues,onRowsChange,doc,rows,projectId,children,onDropChild,activeModal,parentMode,sectionIndices,containerOpen,onContainerToggle,selectedRecordIndex,onSelectRecord,onRowsDeleted,externalSearch,tablePage,onPageChange,linkedPages,currentScreenId,screenHistory,tokens={}}: {node:Node;mode:string;selected:boolean;onPick:()=>void;onMove:(x:number,y:number)=>void;onResize:(w:number,h:number)=>void;onAction:(a:Action|undefined)=>void;onInputChange:(id:string,value:unknown)=>void;inputValues:Record<string,unknown>;onRowsChange:(datasetId:string,rows:Record<string,unknown>[])=>void;doc:Document;rows:Record<string,any>[];projectId:string;children?:React.ReactNode;onDropChild?:(e:React.DragEvent)=>void;activeModal?:string|null;parentMode?:string;sectionIndices?:number[];containerOpen?:boolean;onContainerToggle?:()=>void;selectedRecordIndex?:number|null;onSelectRecord?:(index:number)=>void;onRowsDeleted?:(datasetId:string,indices:number[])=>void;externalSearch?:string;tablePage?:number;onPageChange?:(page:number)=>void;linkedPages?:{page:number;total:number;onChange:(page:number)=>void};currentScreenId?:string;screenHistory?:string[];tokens?:Record<string,string>}) {
 const drag=useRef<{x:number;y:number;startX:number;startY:number}|null>(null);
 const resize=useRef<{x:number;y:number;w:number;h:number}|null>(null);
 const l=node.layout||{},p=node.props||{};const flowChild=!!node.parent_id&&['flow','flex','grid'].includes(parentMode||'');const style:React.CSSProperties={position:flowChild?'relative':'absolute',left:flowChild?undefined:l.x||0,top:flowChild?undefined:l.y||0,width:typeof l.width==='number'?l.width:200,height:mode==='preview'&&COLLAPSIBLE_TYPES.has(node.type)&&containerOpen===false?40:(typeof l.height==='number'?l.height:44),overflowX:l.overflow_x||'visible',overflowY:l.overflow_y||'visible',outline:selected&&mode==='design'?'2px solid #2878e0':'none',boxSizing:'border-box'};
 const nodeStyle=node.style||{};const resolve=(key:string,fallback?:string)=>nodeStyle[key+'_token']?tokens[nodeStyle[key+'_token']]||fallback:nodeStyle[key]||fallback;
 style.color=resolve('color');style.backgroundColor=resolve('background_color');style.borderColor=resolve('border_color');
 const [activePane,setActivePane]=useState(0);
 const [expanded,setExpanded]=useState(p.expanded!==false);
 const paneLabels:Array<string>=Array.isArray(p.tab_labels)&&p.tab_labels.length?p.tab_labels:['Step 1','Step 2'];
 const nestedChildren=React.Children.toArray(children);
 const paneChildren=mode==='design'?nestedChildren:nestedChildren.filter((_,i)=>(sectionIndices?.[i]||0)===activePane);
 if(node.type==='modal'&&mode==='preview'&&activeModal!==node.id)return null;
 const start=(e:React.PointerEvent)=>{if(mode!=='design')return;e.stopPropagation();onPick();drag.current={x:e.clientX,y:e.clientY,startX:Number(l.x||0),startY:Number(l.y||0)};e.currentTarget.setPointerCapture(e.pointerId)};
 const move=(e:React.PointerEvent)=>{if(!drag.current)return;const d=drag.current;onMove(Math.round((d.startX+e.clientX-d.x)/8)*8,Math.round((d.startY+e.clientY-d.y)/8)*8)};
 const end=()=>{drag.current=null};
 const resizeMove=(e:React.PointerEvent)=>{if(!resize.current)return;const v=resize.current;onResize(Math.max(40,Math.round((v.w+e.clientX-v.x)/8)*8),Math.max(24,Math.round((v.h+e.clientY-v.y)/8)*8))};
 let child:React.ReactNode;
 switch(node.type){
 case 'text':child=<span>{p.text||p.label||'Text'}</span>;break;
 case 'button':child=<button className="prototype-button" onClick={()=>mode==='preview'&&onAction(node.action)}>{p.label||'Button'}</button>;break;
 case 'input':child=<input required={!!p.required} minLength={p.min_length===undefined?undefined:Number(p.min_length)} maxLength={p.max_length===undefined?undefined:Number(p.max_length)} placeholder={p.placeholder||'Input'} value={String(inputValues[node.id]??'')} onChange={e=>onInputChange(node.id,e.target.value)} disabled={mode==='design'}/>;break;
 case 'select':child=<select disabled={mode==='design'} value={String(inputValues[node.id]??(p.options||['Option 1','Option 2'])[0]??'')} onChange={e=>onInputChange(node.id,e.target.value)}>{(p.options||['Option 1','Option 2']).map((v:string,i:number)=><option key={i}>{v}</option>)}</select>;break;
 case 'checkbox':child=<label><input required={!!p.required} type="checkbox" checked={Boolean(inputValues[node.id]??false)} onChange={e=>onInputChange(node.id,e.target.checked)} disabled={mode==='design'}/>{p.label||'Checkbox'}</label>;break;
 case 'table':case 'x-editable-grid':{
 const dataset=doc.datasets.find(d=>d.id===p.dataset_id);
 child=dataset?<DataGrid key={node.id+'-'+dataset.id} dataset={dataset} rows={rows}
  options={{searchable:!!p.searchable,sortable:!!p.sortable,selectable:!!p.selectable,filter_column:p.filter_column,filter_value:p.filter_value,page_size:Number(p.page_size)||0}}
  editable={node.type==='x-editable-grid'} canMutate={mode==='preview'&&(dataset.persistence||'seed-reset')==='seed-reset'}
  onRowsChange={updated=>onRowsChange(dataset.id,updated)} externalSearch={externalSearch} externalPage={tablePage} onPageChange={onPageChange} activeIndex={selectedRecordIndex} onSelectRow={onSelectRecord} onRowsDeleted={indices=>onRowsDeleted?.(dataset.id,indices)}/>
  :<div className="table-empty">No dataset assigned. Select table to create sample data.</div>;
 break}
 case 'x-tree':case 'x-list':{
 const dataset=doc.datasets.find(d=>d.id===p.dataset_id);
 child=<DataExtension type={node.type} dataset={dataset} rows={rows} props={p}
  selectedIndex={selectedRecordIndex} onSelect={index=>mode==='preview'&&onSelectRecord?.(index)}/>;
 break}
 case 'x-pagination':child=linkedPages
  ?<DataPagination page={linkedPages.page} totalPages={linkedPages.total} onChange={page=>mode==='preview'&&linkedPages.onChange(page)} label={p.label||'Pages'}/>
  :<div className="table-empty">Link this pagination control to a table with a page size.</div>;break;
 case 'x-menu':child=<MenuObject doc={doc} props={p} mode={mode} currentScreenId={currentScreenId||doc.start_screen}
  history={screenHistory||[]} onNavigate={id=>onAction({type:'navigate',target_screen:id})}>{children}</MenuObject>;break;
 case 'x-breadcrumbs':child=<BreadcrumbsObject doc={doc} props={p} mode={mode} currentScreenId={currentScreenId||doc.start_screen}
  history={screenHistory||[]} onNavigate={id=>onAction({type:'navigate',target_screen:id})}>{children}</BreadcrumbsObject>;break;
 case 'x-schema-map':case 'x-diagram':child=<DiagramView kind={node.type as 'x-schema-map'|'x-diagram'} props={p}/>;break;
 case 'x-timeline':child=<TimelineView dataset={doc.datasets.find(d=>d.id===p.dataset_id)} rows={rows} props={p}
  onSelect={index=>mode==='preview'&&onSelectRecord?.(index)}/>;break;
 case 'x-file-preview':child=<FilePreviewView props={p}
  assetUrl={p.asset?apiUrl('/api/projects/'+projectId+'/images/'+encodeURIComponent(String(p.asset).replace('assets/',''))):undefined}/>;break;
 case 'x-record-detail':{
 const dataset=doc.datasets.find(d=>d.id===p.dataset_id);
 child=<RecordDetail dataset={dataset} rows={rows} selectedIndex={selectedRecordIndex??null}
  label={p.label} editable={!!p.editable} canMutate={mode==='preview'&&(dataset?.persistence||'seed-reset')==='seed-reset'}
  onRowsChange={updated=>{if(dataset)onRowsChange(dataset.id,updated)}}/>;
 break}
 case 'image':child=p.asset?<img alt={p.alt||'Design image'} src={apiUrl('/api/projects/'+projectId+'/images/'+encodeURIComponent(String(p.asset).replace('assets/','')))} style={{maxWidth:'100%',maxHeight:'100%'}}/>:<span className="muted">Choose an image asset</span>;break;
 case 'tabs':case 'x-wizard':child=<div className="sc-panel-container" data-panel-kind={node.type}><nav aria-label={node.type==='tabs'?'Tabs':'Wizard steps'} className="sc-panel-nav">{paneLabels.map((name:string,i:number)=><button type="button" key={i} aria-pressed={activePane===i} disabled={mode==='design'} onClick={()=>setActivePane(i)}>{name}</button>)}</nav><div className="nested-content sc-panel-content">{paneChildren}</div>{node.type==='x-wizard'&&mode==='preview'&&<div className="sc-wizard-buttons"><button disabled={activePane===0} onClick={()=>setActivePane(v=>Math.max(0,v-1))}>Previous step</button><button disabled={activePane===paneLabels.length-1} onClick={()=>setActivePane(v=>Math.min(paneLabels.length-1,v+1))}>Next step</button></div>}</div>;break;
 case 'x-accordion':child=<div className="sc-accordion"><button type="button" aria-expanded={expanded} onClick={()=>mode==='preview'&&setExpanded(v=>!v)}>{p.label||'Details'} {expanded?'▾':'▸'}</button>{(expanded||mode==='design')&&<div className="nested-content">{children}</div>}</div>;break;
 case 'modal':child=<div className="modal-preview"><strong>{p.label||p.title||'Dialog'}</strong><div className="nested-content">{children}</div><button type="button" onClick={()=>mode==='preview'&&onAction({type:'close_modal'})}>Close</button></div>;break;
 case 'container':case 'x-card':case 'x-grid':case 'x-flex':case 'x-toolbar':case 'x-sidebar':case 'x-splitter':child=<div className={'container-outline nested-'+node.type.replace(/[^a-z0-9-]/g,'')}>
 <div className="sc-collapse-header"><strong>{p.label||node.type}</strong>{p.collapsible&&<button type="button" aria-label={'Toggle '+(p.label||node.type)} aria-expanded={mode==='design'?true:containerOpen!==false} onClick={e=>{e.stopPropagation();if(mode==='preview')onContainerToggle?.()}} disabled={mode==='design'}>{mode==='preview'&&containerOpen===false?'▸':'▾'}</button>}</div>
 {(mode==='design'||containerOpen!==false)&&<div className="nested-content" style={node.type==='x-sidebar'?{display:'flex',gap:8}:node.type==='x-splitter'?{display:'grid',gridTemplateColumns:String(Math.max(10,Math.min(90,Number(p.split_percent)||50)))+'% 1fr',gap:8}:undefined}>{children}</div>}</div>;break;
 case 'x-date':child=<label>{p.label||'Date'} <input required={!!p.required} min={p.min||undefined} max={p.max||undefined} type="date" value={String(inputValues[node.id]??'')} onChange={e=>onInputChange(node.id,e.target.value)} disabled={mode==='design'}/></label>;break;
 case 'x-number':child=<input required={!!p.required} min={p.min===undefined?undefined:Number(p.min)} max={p.max===undefined?undefined:Number(p.max)} type="number" placeholder={p.placeholder||'0'} value={String(inputValues[node.id]??'')} onChange={e=>onInputChange(node.id,e.target.value)} disabled={mode==='design'}/>;break;
 case 'x-textarea':child=<textarea required={!!p.required} minLength={p.min_length===undefined?undefined:Number(p.min_length)} maxLength={p.max_length===undefined?undefined:Number(p.max_length)} placeholder={p.placeholder||'Enter text'} value={String(inputValues[node.id]??'')} onChange={e=>onInputChange(node.id,e.target.value)} disabled={mode==='design'}/>;break;
 case 'x-time':child=<label>{p.label||'Time'} <input type="time" aria-label={p.label||'Time'} required={!!p.required} min={p.min||undefined} max={p.max||undefined} value={String(inputValues[node.id]??p.value??'')} onChange={e=>onInputChange(node.id,e.target.value)} disabled={mode==='design'}/></label>;break;
 case 'x-radio':child=<fieldset className="sc-radio"><legend>{p.label||'Choose'}</legend>{(p.options||[]).map((option:any,i:number)=>{const value=typeof option==='string'?option:String(option.value??option.label??'');return <label key={i}><input type="radio" name={'sc-radio-'+node.id} value={value} required={!!p.required} checked={String(inputValues[node.id]??p.value??'')===value} disabled={mode==='design'} onChange={()=>onInputChange(node.id,value)}/>{typeof option==='string'?option:String(option.label??option.value??'')}</label>})}</fieldset>;break;
 case 'x-toggle':child=<label className="sc-toggle"><input type="checkbox" role="switch" aria-label={p.label||'Toggle'} checked={Boolean(inputValues[node.id]??p.checked??false)} disabled={mode==='design'} onChange={e=>onInputChange(node.id,e.target.checked)}/>{p.label||'Toggle'}</label>;break;
 case 'x-file-upload':child=<label className="sc-file-input">{p.label||'Choose file'}<input aria-label={p.label||'Choose file'} type="file" accept={p.accept||undefined} disabled={mode==='design'} onChange={e=>onInputChange(node.id,e.target.files?.[0]?.name||'')}/><small>{String(inputValues[node.id]??'No file selected')}</small><small>Prototype: filename only; no file contents are stored or uploaded.</small></label>;break;
 case 'x-search':child=<label className="sc-search">{p.label||'Search'}<input type="search" aria-label={p.label||'Search'} placeholder={p.placeholder||'Search records'} value={String(inputValues[node.id]??p.value??'')} disabled={mode==='design'} onChange={e=>onInputChange(node.id,e.target.value)}/></label>;break;
 case 'x-kpi':child=<MetricCard props={p} rows={rows}/>;break;
 case 'x-chart':child=<DataChart props={p} rows={rows}/>;break;
 default:child=<div className="unsupported-object" role="note">Unsupported object: {node.type} (preserved)</div>;
 }
 return <div className={'canvas-node'+(mode==='design'?' editable':'')} style={style} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onClick={e=>{if(mode==='design'){e.stopPropagation();onPick()}}} onDragOver={e=>{if(mode==='design'&&isContainer(node.type)){e.stopPropagation();e.preventDefault()}}} onDrop={e=>{if(mode==='design'&&isContainer(node.type)){e.stopPropagation();e.preventDefault();onDropChild?.(e)}}} >{child}{mode==='design'&&selected&&<span className="resize-handle" title="Resize" onPointerDown={e=>{e.stopPropagation();resize.current={x:e.clientX,y:e.clientY,w:Number(l.width||200),h:Number(l.height||44)};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{e.stopPropagation();resizeMove(e)}} onPointerUp={e=>{e.stopPropagation();resize.current=null}}/>}</div>
}
function Editor({doc,setDoc,onSave,onExport,canEdit,projectId,onImageUpload}: {doc:Document;setDoc:(v:Document)=>void;onSave:()=>void;onExport:()=>void;canEdit:boolean;projectId:string;onImageUpload:(file:File,screenId:string,nodeId:string)=>void}) {
 const [mode,setMode]=useState<'design'|'preview'>('design'),[screenId,setScreenId]=useState(doc.start_screen),[screenNameDraft,setScreenNameDraft]=useState(''),[selected,setSelected]=useState<string|null>(null),[theme,setTheme]=useState(doc.default_theme),[message,setMessage]=useState(''),[modal,setModal]=useState<string|null>(null),[rows,setRows]=useState<Record<string,Record<string,any>[]>>({});
 const previewSession=useRef('preview-'+crypto.randomUUID());
 const [previewRevision,setPreviewRevision]=useState<Record<string,number>>({});
 const [inputValues,setInputValues]=useState<Record<string,unknown>>({});
 const [containerStates,setContainerStates]=useState<Record<string,boolean>>({});
 const [recordSelection,setRecordSelection]=useState<Record<string,number|null>>({});
 const [tablePages,setTablePages]=useState<Record<string,number>>({});
 useEffect(()=>{if(mode!=='preview')return;doc.datasets.filter(d=>d.persistence==='session-persisted'||d.persistence==='project-shared').forEach(async d=>{try{const result=await request('/api/projects/'+projectId+'/data/'+encodeURIComponent(d.id),{method:'POST',body:JSON.stringify({mode:d.persistence,operation:'list',session_id:previewSession.current})});setRows(v=>({...v,[d.id]:result.rows}));setPreviewRevision(v=>({...v,[d.id]:result.revision}))}catch(e){setMessage(String(e))}})},[mode,projectId]);
 const [history,setHistory]=useState<Document[]>([]),[future,setFuture]=useState<Document[]>([]),[screensBack,setScreensBack]=useState<string[]>([]);
 const screen=doc.screens.find(s=>s.id===screenId)||doc.screens[0];const node=screen.nodes.find(n=>n.id===selected);
 useEffect(()=>{setScreenNameDraft(screen.name)},[screen.id,screen.name]);
 function renameScreen(){
   const next=screenNameDraft.trim();
   if(!canEdit || !next || next===screen.name){setScreenNameDraft(screen.name);return}
   edit({...doc,screens:doc.screens.map(s=>s.id===screen.id?{...s,name:next}:s)});
 }
 const dataRows=(id:string)=>rows[id]||doc.datasets.find(d=>d.id===id)?.rows||[];
 function edit(next:Document){if(!canEdit)return;setHistory(h=>[...h.slice(-40),cloneDoc(doc)]);setFuture([]);setDoc(next)}
 function property(key:string,value:any,section:'props'|'layout'='props'){if(!node)return;edit(updateNode(doc,screen.id,node.id,n=>({...n,[section]:{...n[section],[key]:value}})))}
 function toggleContainer(id:string,kind:'toggle_container'|'collapse_container'|'expand_container'='toggle_container'){
  const target=screen.nodes.find(n=>n.id===id&&COLLAPSIBLE_TYPES.has(n.type));
  if(!target)return;
  const current=containerStates[id]??(target.props.expanded!==false);
  setContainerStates(states=>({...states,[id]:kind==='collapse_container'?false:kind==='expand_container'?true:!current}));
 }
 function navigateShared(id:string){
  if(!doc.screens.some(s=>s.id===id)||id===screenId)return;
  setScreensBack(h=>[...h,screenId]);setScreenId(id);setSelected(null);setModal(null);
 }
 async function act(a:Action|undefined){if(!a)return;
 if(['toggle_container','collapse_container','expand_container'].includes(a.type)){
  if(a.target_node)toggleContainer(a.target_node,a.type as 'toggle_container'|'collapse_container'|'expand_container');
  return;
 }
 if(a.type==='navigate'&&doc.screens.some(s=>s.id===a.target_screen)){setScreensBack(h=>[...h,screenId]);setScreenId(a.target_screen!)}
 else if(a.type==='back')setScreensBack(h=>{const copy=[...h];setScreenId(copy.pop()||screenId);return copy});
 else if(a.type==='message')setMessage(a.text||'');
 else if(a.type==='add_mock_row'&&a.dataset_id){const id=a.dataset_id;const data=doc.datasets.find(d=>d.id===id);if(!data){setMessage('Choose an existing dataset for this button.');return}const errors=validateBoundInputs(a,screen.nodes,inputValues);if(errors.length){setMessage('Validation: '+errors.join('; '));return}setMessage('');const row=resolveActionRow(a,screen.nodes,inputValues);if(!Object.keys(row).length){setMessage('Configure fixed values or bind input fields for the new row.');return}const kind=data.persistence||'seed-reset';if(kind==='seed-reset')setRows(v=>({...v,[id]:[...dataRows(id),row]}));else try{const result=await request('/api/projects/'+projectId+'/data/'+encodeURIComponent(id),{method:'POST',body:JSON.stringify({mode:kind,operation:'add',values:row,session_id:previewSession.current,revision:previewRevision[id]})});setRows(v=>({...v,[id]:result.rows}));setPreviewRevision(v=>({...v,[id]:result.revision}))}catch(e){setMessage(String(e))}}
 else if(a.type==='show_modal')setModal(a.target_node||'modal');
 else if(a.type==='close_modal')setModal(null);}
 function addScreen(){const id='screen-'+crypto.randomUUID().slice(0,8);
 let number=2;
 while(doc.screens.some(s=>s.name.toLowerCase()==='new screen '+number))number++;
 const name=doc.screens.some(s=>s.name.toLowerCase()==='new screen')?'New Screen '+number:'New Screen';
 edit({...doc,screen_order:[...doc.screen_order,id],screens:[...doc.screens,{id,name,viewport:{width:1280,height:800},layout:{mode:'freeform',overflow_x:'auto',overflow_y:'auto'},nodes:[]}]});setScreenId(id)}
 function moveScreen(id:string,direction:-1|1){const next=reorderScreen(doc,id,direction);if(next!==doc)edit(next)}
 function deleteScreen(id:string){
   if(!canEdit||doc.screens.length<=1)return;
   const target=doc.screens.find(s=>s.id===id);if(!target)return;
   const references=doc.screens.reduce((total,s)=>total+s.nodes.filter(n=>n.action?.type==='navigate'&&n.action.target_screen===id).length,0);
   if(!window.confirm('Delete screen "'+target.name+'" and all its objects?'+
     (references?' '+references+' navigation action(s) targeting this screen will be cleared.':'')+
     ' This can be undone before saving.'))return;
   const next=removeScreen(doc,id);if(next===doc)return;
   edit(next);
   const ordered=next.screen_order;
   if(screenId===id){setScreenId(next.start_screen);setSelected(null);setModal(null)}
   setScreensBack(history=>history.filter(screenId=>ordered.includes(screenId)));
 }
 function updateSharedNavigation(patch:Record<string,unknown>){
  const nav=doc.shared_navigation||defaultSharedNavigation(doc);
  edit({...doc,shared_navigation:{...nav,...patch}});
 }
 function updateNavItem(id:string,patch:Record<string,unknown>){
  const nav=doc.shared_navigation;if(!nav)return;
  updateSharedNavigation({items:nav.items.map(item=>item.id===id?{...item,...patch}:item)});
 }
 function moveNavItem(id:string,direction:-1|1){
  const nav=doc.shared_navigation;if(!nav)return;
  const items=[...nav.items],i=items.findIndex(item=>item.id===id),j=i+direction;
  if(i<0||j<0||j>=items.length)return;
  [items[i],items[j]]=[items[j],items[i]];updateSharedNavigation({items});
 }
 function deleteNavItem(id:string){
  const nav=doc.shared_navigation;if(!nav)return;
  updateSharedNavigation({items:nav.items.filter(item=>item.id!==id).map(item=>item.parent_id===id?{...item,parent_id:null}:item)});
 }
 function deleteObject(id:string){const removed=removeNodeTree(doc,screen.id,id);edit(removed);if(!removed.screens.find(s=>s.id===screen.id)?.nodes.some(n=>n.id===selected))setSelected(null)}
 function addFromGallery(type:string,parentId:string|null=null,x=24,y=24){
   if(!canEdit||mode!=='design')return;
   const generated=withTableDataset(doc,newNode(type,x,y));
   if(type==='x-record-detail'){
     const source=screen.nodes.find(n=>['table','x-editable-grid'].includes(n.type)&&n.props.dataset_id);
     if(source)generated.node.props={...generated.node.props,dataset_id:source.props.dataset_id,source_table_id:source.id};
   }
   generated.node.parent_id=parentId;
   edit(insertNode(generated.document,screen.id,generated.node));
   setSelected(generated.node.id)
 }
 function placeFromDrop(e:React.DragEvent,parentId:string|null=null){
   e.preventDefault();if(!canEdit||mode!=='design')return;
   const type=e.dataTransfer.getData('application/screencraft-type');
   const move=e.dataTransfer.getData('application/screencraft-node');
   if(move){const newDoc=reparentNode(doc,screen.id,move,parentId);if(newDoc!==doc){edit(newDoc);setSelected(move)}return}
   if(!palette.includes(type))return;
   const rect=e.currentTarget.getBoundingClientRect();
   addFromGallery(type,parentId,Math.max(8,Math.round(e.clientX-rect.left)),Math.max(8,Math.round(e.clientY-rect.top)))
 }
 function saveComponent(){
   if(!node)return;
   const tree=cloneSubtree(screen,node.id);
   const label=String(node.props.label||node.props.text||node.type);
   edit({...doc,components:[...doc.components,{id:'component-'+crypto.randomUUID(),name:label,nodes:tree}]});
 }
 function addComponent(component:any){
   if(!canEdit||mode!=='design')return;
   const nodes:Array<Node>=component.nodes||[];
   const map=new Map(nodes.map(n=>[n.id,crypto.randomUUID()]));
   const copies=nodes.map(n=>({...cloneDoc(n),id:map.get(n.id)!,parent_id:n.parent_id?map.get(n.parent_id)||null:null}));
   edit({...doc,screens:doc.screens.map(s=>s.id===screen.id?{...s,nodes:[...s.nodes,...copies]}:s)});
   if(copies[0])setSelected(copies[0].id);
 }
 function renderTree(n:Node,ancestors=new Set<string>()):React.ReactNode{
   if(ancestors.has(n.id))return null;
   const path=new Set([...ancestors,n.id]);
   return <CanvasNode key={n.id} node={n} tokens={doc.themes[theme]?.tokens||{}} mode={mode} selected={n.id===selected}
     onPick={()=>setSelected(n.id)}
     onMove={(x,y)=>{if(canEdit)setDoc(updateNode(doc,screen.id,n.id,v=>({...v,layout:{...v.layout,x,y}}))) }}
     onResize={(width,height)=>{if(canEdit)setDoc(updateNode(doc,screen.id,n.id,v=>({...v,layout:{...v.layout,width,height}}))) }}
     onAction={act} onInputChange={(id,value)=>setInputValues(v=>({...v,[id]:value}))} inputValues={inputValues} onRowsChange={(id,updated)=>setRows(v=>({...v,[id]:updated}))} projectId={projectId} doc={doc} rows={dataRows(n.props.dataset_id||'')} activeModal={modal} parentMode={screen.nodes.find(v=>v.id===n.parent_id)?.layout.mode}
     currentScreenId={screen.id} screenHistory={screensBack}
     onDropChild={e=>placeFromDrop(e,n.id)}
     containerOpen={containerStates[n.id]??(n.props.expanded!==false)}
     onContainerToggle={()=>toggleContainer(n.id)}
     selectedRecordIndex={n.type==='x-record-detail'
       ?(n.props.source_table_id?recordSelection[n.props.source_table_id]??null:recordSelection[n.props.dataset_id||'']??null)
       :(recordSelection[n.id]??null)}
     externalSearch={['table','x-editable-grid'].includes(n.type)
       ?screen.nodes.filter(source=>source.type==='x-search'&&source.props.target_table_id===n.id)
        .map(source=>String(inputValues[source.id]??'')).filter(Boolean).join(' ')
       :undefined}
     tablePage={['table','x-editable-grid'].includes(n.type)?(tablePages[n.id]??0):undefined}
     onPageChange={page=>setTablePages(v=>({...v,[n.id]:page}))}
     linkedPages={n.type==='x-pagination'&&n.props.target_table_id?(()=>{
       const table=screen.nodes.find(item=>item.id===n.props.target_table_id&&['table','x-editable-grid'].includes(item.type));
       if(!table)return undefined;
       const pageSize=Math.max(1,Number(table.props.page_size)||0);
       const total=Math.max(1,Math.ceil(dataRows(table.props.dataset_id||'').length/pageSize));
       return {page:tablePages[table.id]??0,total,onChange:(page:number)=>setTablePages(v=>({...v,[table.id]:page}))};
     })():undefined}
     onSelectRecord={index=>setRecordSelection(v=>({...v,[n.id]:index,[n.props.dataset_id||'']:index}))}
     onRowsDeleted={(datasetId,indices)=>{
       const removed=new Set(indices);
       const linked=screen.nodes.filter(x=>['table','x-editable-grid'].includes(x.type)&&x.props.dataset_id===datasetId).map(x=>x.id);
       const keys=new Set([datasetId,...linked]);
       setRecordSelection(state=>Object.fromEntries(Object.entries(state).map(([key,value])=>{
         if(!keys.has(key)||value==null)return [key,value];
         return [key,removed.has(value)?null:value-indices.filter(index=>index<value).length];
       })));
     }}
     sectionIndices={screen.nodes.filter(child=>child.parent_id===n.id).map(child=>Number(child.props.tab_index)||0)}>
       {screen.nodes.filter(child=>child.parent_id===n.id).map(child=>renderTree(child,path))}
     </CanvasNode>
 }
 function goBack(){setScreensBack(h=>{const copy=[...h];setScreenId(copy.pop()||doc.start_screen);return copy})}
 function goHome(){setScreenId(doc.start_screen);setScreensBack([]);setModal(null);setSelected(null)}
 function layerDepth(n:Node){let depth=0,parent=n.parent_id,seen=new Set([n.id]);while(parent&&!seen.has(parent)){seen.add(parent);depth++;parent=screen.nodes.find(x=>x.id===parent)?.parent_id||null}return Math.min(depth,8)}
 const tokens=doc.themes[theme]?.tokens||{};const dark=theme.toLowerCase().includes('dark');const vars:Record<string,string>={
 '--sc-page':tokens['surface.page']||tokens['surface.default']||(dark?'#101827':'#fff'),
 '--sc-surface':tokens['surface.default']||(dark?'#1E293B':'#fff'),
 '--sc-nav':tokens['surface.nav']||(dark?'#0B1220':'#e9f1fc'),
 '--sc-text':tokens['text.primary']||(dark?'#F1F5F9':'#172033'),
 '--sc-muted':tokens['text.secondary']||(dark?'#94A3B8':'#52647b'),
 '--sc-border':tokens['border.default']||(dark?'#334155':'#cbd5e1'),
 '--sc-accent':tokens['action.primary']||'#2563eb',
 '--sc-field':tokens['surface.input']||tokens['surface.default']||(dark?'#1E293B':'#fff'),
 '--sc-field-text':tokens['text.primary']||(dark?'#F1F5F9':'#172033'),
 '--sc-selected':tokens['surface.selected']||(dark?'#263F66':'#dbeafe'),
 '--sc-disabled':tokens['text.disabled']||(dark?'#94A3B8':'#64748b'),
 '--sc-color-scheme':dark?'dark':'light'
};const canvasStyle:React.CSSProperties={...vars,width:screen.viewport.width,minHeight:screen.viewport.height,background:'var(--sc-page)',color:'var(--sc-text)',position:'relative',overflowX:screen.layout.overflow_x||'auto',overflowY:screen.layout.overflow_y||'auto'};
 return <div className="workspace"><aside className="sidebar"><h3>Screens</h3>{doc.screen_order.map((id,i)=>{const s=doc.screens.find(v=>v.id===id);if(!s)return null;return <div className="screen-list-row" key={id}><button className={id===screen.id?'active':''} onClick={()=>{setScreenId(id);setSelected(null)}}>{s.name}</button><button aria-label={'Move screen '+s.name+' up'} title="Move screen up" disabled={!canEdit||i===0} onClick={()=>moveScreen(id,-1)}>↑</button><button aria-label={'Move screen '+s.name+' down'} title="Move screen down" disabled={!canEdit||i===doc.screen_order.length-1} onClick={()=>moveScreen(id,1)}>↓</button><button aria-label={'Delete screen '+s.name} title={doc.screens.length<=1?'Cannot delete the last screen':'Delete screen'} disabled={!canEdit||doc.screens.length<=1} onClick={()=>deleteScreen(id)}>×</button></div>})}<button disabled={!canEdit} onClick={addScreen}>+ Screen</button><h3>Object Gallery</h3><div className="palette">{Array.from(new Set(catalogueEntries.map(o=>o.category))).map(category=><details key={category} open={['Content','Inputs','Layout','Data'].includes(category)}><summary>{category}</summary><div className="palette-group">{catalogueEntries.filter(o=>o.category===category).map(entry=><button key={entry.id} data-catalogue-type={entry.id} title={entry.description+(isSupported(entry.id)?'':' · unsupported preview placeholder')} draggable={canEdit&&mode==='design'} onDragStart={e=>e.dataTransfer.setData('application/screencraft-type',entry.id)} onClick={()=>addFromGallery(entry.id)}>{entry.id}{!isSupported(entry.id)?' ◇':''}</button>)}</div></details>)}</div><h3>Reusable components</h3>{doc.components.map((item:any)=><button key={item.id} disabled={!canEdit} onClick={()=>addComponent(item)} title="Insert an editable copy">{item.name||item.id}</button>)}<h3>Layers</h3>{screen.nodes.map(n=><div className="layer-list-row" key={n.id} style={{paddingLeft:layerDepth(n)*12}}><button draggable={canEdit&&mode==='design'} onDragStart={e=>e.dataTransfer.setData('application/screencraft-node',n.id)} className={n.id===selected?'active':''} onClick={()=>setSelected(n.id)}>{n.type} · {n.id.slice(0,9)}</button><button aria-label={'Delete '+n.type+' '+n.id.slice(0,9)} title="Delete object and its children" disabled={!canEdit} onClick={()=>{deleteObject(n.id)}}>×</button></div>)}</aside>
 <div className="mainarea"><div className="toolbar"><button onClick={()=>setMode(mode==='design'?'preview':'design')}>{mode==='design'?'▶ Preview':'✎ Design'}</button>{mode==='preview'&&<><button type="button" aria-label="Preview back" disabled={!screensBack.length} onClick={goBack}>← Back</button><button type="button" aria-label="Preview home" onClick={goHome}>⌂ Home</button><span className="muted">Preview: {screen.name}</span></>}<button disabled={!history.length||!canEdit} onClick={()=>{setFuture(f=>[...f,doc]);setDoc(history[history.length-1]);setHistory(h=>h.slice(0,-1))}}>Undo</button><button disabled={!future.length||!canEdit} onClick={()=>{setHistory(h=>[...h,doc]);setDoc(future[future.length-1]);setFuture(f=>f.slice(0,-1))}}>Redo</button><label>Theme <select value={theme} onChange={e=>setTheme(e.target.value)}>{Object.keys(doc.themes).map(t=><option key={t}>{t}</option>)}</select></label><button onClick={onSave} disabled={!canEdit}>Save</button><button onClick={onExport}>Interactive HTML</button><span className="muted">{screen.viewport.width}×{screen.viewport.height}</span></div>
 <div className={'shared-preview-layout nav-layout-'+(doc.shared_navigation?.position||'left')}>
 {mode==='preview'&&doc.shared_navigation?.enabled&&!screen.shared_navigation_hidden&&
  <SharedNavigation navigation={doc.shared_navigation} active={screen.id} validScreens={new Set(doc.screens.map(s=>s.id))} onNavigate={navigateShared}/>}
 <div className="workscroll"><div className="canvas sc-theme" style={canvasStyle} onDragOver={e=>e.preventDefault()} onDrop={e=>placeFromDrop(e)} onClick={()=>setSelected(null)}>{screen.nodes.filter(n=>!n.parent_id).map(n=>renderTree(n))}</div></div></div>{message&&<div className="notice" onClick={()=>setMessage('')}>{message} ×</div>}</div>
 <aside className="inspector"><details className="shared-nav-editor"><summary>Shared application navigation</summary>
  <p className="muted">One menu stored at application level, not copied into screen nodes.</p>
  <label>Enabled<input aria-label="Enable shared navigation" type="checkbox" disabled={!canEdit}
   checked={!!doc.shared_navigation?.enabled} onChange={e=>updateSharedNavigation({enabled:e.target.checked})}/></label>
  {doc.shared_navigation?.enabled&&<>
   <label>Position<select aria-label="Navigation position" disabled={!canEdit} value={doc.shared_navigation.position} onChange={e=>updateSharedNavigation({position:e.target.value})}>
    <option value="left">Left sidebar</option><option value="right">Right sidebar</option><option value="top">Horizontal top</option>
   </select></label>
   <label>Allow collapse<input type="checkbox" aria-label="Allow navigation collapse" disabled={!canEdit} checked={doc.shared_navigation.collapsible} onChange={e=>updateSharedNavigation({collapsible:e.target.checked})}/></label>
   <label>Initially collapsed<input type="checkbox" aria-label="Navigation initially collapsed" disabled={!canEdit} checked={!!doc.shared_navigation.initial_collapsed} onChange={e=>updateSharedNavigation({initial_collapsed:e.target.checked})}/></label>
   <label>Mobile starts collapsed<input type="checkbox" aria-label="Mobile navigation collapsed" disabled={!canEdit} checked={doc.shared_navigation.mobile_collapsed!==false} onChange={e=>updateSharedNavigation({mobile_collapsed:e.target.checked})}/></label>
   <h4>Shared menu items</h4>
   {doc.shared_navigation.items.map((item,i)=><div className="shared-nav-item-editor" key={item.id}>
    <label>Label<input aria-label={'Menu label '+i} disabled={!canEdit} value={item.label} onChange={e=>updateNavItem(item.id,{label:e.target.value})}/></label>
    <label>Icon or symbol<input aria-label={'Menu icon '+i} disabled={!canEdit} value={item.icon||''} onChange={e=>updateNavItem(item.id,{icon:e.target.value})}/></label>
    <label>Target screen<select aria-label={'Menu screen '+i} disabled={!canEdit} value={item.target_screen||''} onChange={e=>updateNavItem(item.id,{target_screen:e.target.value})}>
     <option value="">Group heading</option>{doc.screens.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
    </select></label>
    <label>Nested beneath<select aria-label={'Menu parent '+i} disabled={!canEdit} value={item.parent_id||''} onChange={e=>updateNavItem(item.id,{parent_id:e.target.value||null})}>
     <option value="">Top level</option>{doc.shared_navigation?.items.filter(other=>other.id!==item.id&&!other.parent_id).map(other=><option key={other.id} value={other.id}>{other.label}</option>)}
    </select></label>
    <label>Hidden on screens<select aria-label={'Menu hidden on '+i} multiple disabled={!canEdit} value={item.hidden_on||[]} onChange={e=>updateNavItem(item.id,{hidden_on:Array.from(e.currentTarget.selectedOptions,option=>option.value)})}>
     {doc.screens.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
    </select></label>
    <div className="shared-nav-item-actions"><button disabled={!canEdit||i===0} aria-label={'Move menu '+i+' up'} onClick={()=>moveNavItem(item.id,-1)}>↑</button>
     <button disabled={!canEdit||i===doc.shared_navigation!.items.length-1} aria-label={'Move menu '+i+' down'} onClick={()=>moveNavItem(item.id,1)}>↓</button>
     <button disabled={!canEdit} aria-label={'Delete menu '+i} onClick={()=>deleteNavItem(item.id)}>Delete</button></div>
   </div>)}
   <button disabled={!canEdit} onClick={()=>updateSharedNavigation({items:[...doc.shared_navigation!.items,{id:'nav-'+crypto.randomUUID().slice(0,8),label:'New link',target_screen:screen.id}]})}>+ Menu item</button>
  </>}
 </details>
 <h3>Screen</h3><label>Hide shared navigation on this screen<input aria-label="Hide navigation on screen" type="checkbox" disabled={!canEdit} checked={!!screen.shared_navigation_hidden} onChange={e=>edit({...doc,screens:doc.screens.map(s=>s.id===screen.id?{...s,shared_navigation_hidden:e.target.checked}:s)})}/></label><label>Screen name<input aria-label="Screen name" disabled={!canEdit} maxLength={120} value={screenNameDraft} onChange={e=>setScreenNameDraft(e.target.value)} onBlur={renameScreen} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape'){setScreenNameDraft(screen.name);e.currentTarget.blur()}}}/></label><p className="muted">Renaming keeps the screen ID and navigation links intact.</p><h3>Properties</h3>{node? <><div className="object-inspector-head"><strong>{node.type}</strong><button type="button" aria-label="Delete selected object" title="Delete object and all nested children" disabled={!canEdit} onClick={()=>deleteObject(node.id)}>Delete object ×</button></div>{!isSupported(node.type)&&<p role="note" className="unsupported-object">This extension is not yet rendered. Its JSON is preserved when saved.</p>}<label>Parent container<select aria-label="Parent container" disabled={!canEdit} value={node.parent_id||''} onChange={e=>edit(reparentNode(doc,screen.id,node.id,e.target.value||null))}><option value="">Screen root</option>{screen.nodes.filter(n=>n.id!==node.id&&isContainer(n.type)).map(n=><option key={n.id} value={n.id}>{n.props.label||n.type} · {n.id.slice(0,8)}</option>)}</select></label><button type="button" disabled={!canEdit} onClick={saveComponent}>Save as reusable component</button>{(node.type==='text'?['text']:node.type==='button'?['label']:node.type==='input'?['placeholder']:(node.type==='table'||node.type==='x-editable-grid')?[]:['label']).map(k=><label key={k}>{k}<input value={String(node.props[k]||'')} onChange={e=>property(k,e.target.value)} disabled={!canEdit}/></label>)}{['input','select','checkbox','x-date','x-number','x-textarea','x-time','x-radio','x-toggle','x-file-upload','x-search'].includes(node.type)&&<section className="input-validation">
 <h3>Input validation</h3>
 <label>Required<input type="checkbox" aria-label="Required field" disabled={!canEdit} checked={Boolean(node.props.required)} onChange={e=>property('required',e.target.checked)}/></label>
 {['input','x-textarea'].includes(node.type)&&<>
  <label>Minimum characters<input type="number" aria-label="Minimum characters" min="0" max="10000" disabled={!canEdit} value={node.props.min_length??''} onChange={e=>property('min_length',e.target.value===''?undefined:Math.max(0,Number(e.target.value)||0))}/></label>
  <label>Maximum characters<input type="number" aria-label="Maximum characters" min="0" max="10000" disabled={!canEdit} value={node.props.max_length??''} onChange={e=>property('max_length',e.target.value===''?undefined:Math.max(0,Number(e.target.value)||0))}/></label>
 </>}
 {['x-number','x-date','x-time'].includes(node.type)&&<>
  <label>Minimum value<input aria-label="Minimum value" type={node.type==='x-date'?'date':node.type==='x-time'?'time':'number'} disabled={!canEdit} value={node.props.min??''} onChange={e=>property('min',e.target.value)}/></label>
  <label>Maximum value<input aria-label="Maximum value" type={node.type==='x-date'?'date':'number'} disabled={!canEdit} value={node.props.max??''} onChange={e=>property('max',e.target.value)}/></label>
 </>}
 {['select','x-radio'].includes(node.type)&&<label>Dropdown choices (one per line)<textarea aria-label="Dropdown choices" disabled={!canEdit} value={(node.props.options||[]).map((x:any)=>typeof x==='string'?x:(x?.label||x?.value||'')).join('\n')} onChange={e=>property('options',e.target.value.split('\n').map(x=>x.trim()).filter(Boolean))}/></label>}
 {node.type==='x-file-upload'&&<label>Accepted file types<input aria-label="Accepted file types" disabled={!canEdit} value={node.props.accept||''} onChange={e=>property('accept',e.target.value)} placeholder=".pdf,.png,image/*"/></label>}
 {node.type==='x-search'&&<label>Filter table/grid<select aria-label="Search target table" disabled={!canEdit} value={node.props.target_table_id||''} onChange={e=>property('target_table_id',e.target.value)}><option value="">No linked table</option>{screen.nodes.filter(n=>['table','x-editable-grid'].includes(n.type)).map(n=><option key={n.id} value={n.id}>{n.props.label||n.type} · {n.id.slice(0,8)}</option>)}</select></label>}
 <small className="muted">Rules are checked when an Add Row button uses this field as an input source.</small>
 </section>}
 {(node.type==='x-kpi'||node.type==='x-chart')&&<section className="metric-configuration" aria-label="Metric configuration">
 <h3>Data source</h3>
 <label>Metric dataset<select aria-label="Metric dataset" disabled={!canEdit} value={node.props.dataset_id||''} onChange={e=>property('dataset_id',e.target.value)}><option value="">Static (KPI only)</option>{doc.datasets.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}</select></label>
 <label>Aggregation<select aria-label="Metric aggregation" disabled={!canEdit} value={node.props.aggregation||'count'} onChange={e=>property('aggregation',e.target.value)}>{['count','sum','average','min','max'].map(v=><option key={v} value={v}>{v}</option>)}</select></label>
 <label>Value column<select aria-label="Metric value column" disabled={!canEdit} value={node.props.value_column||''} onChange={e=>property('value_column',e.target.value)}><option value="">Choose column</option>{doc.datasets.find(d=>d.id===node.props.dataset_id)?.columns.map(c=><option key={c.id} value={c.id}>{c.id}</option>)}</select></label>
 {node.type==='x-chart'&&<><label>Chart type<select aria-label="Chart type" disabled={!canEdit} value={node.props.chart_type||'bar'} onChange={e=>property('chart_type',e.target.value)}>{['bar','line','pie'].map(v=><option key={v} value={v}>{v}</option>)}</select></label>
 <label>Category column<select aria-label="Category column" disabled={!canEdit} value={node.props.category_column||''} onChange={e=>property('category_column',e.target.value)}><option value="">Choose column</option>{doc.datasets.find(d=>d.id===node.props.dataset_id)?.columns.map(c=><option key={c.id} value={c.id}>{c.id}</option>)}</select></label></>}
 <small className="muted">Count uses the number of matching rows. Numeric operations ignore non-numeric values.</small>
 </section>}
 {(node.type==='tabs'||node.type==='x-wizard')&&<label>Step labels (comma separated)<input aria-label="Step labels" disabled={!canEdit} value={(node.props.tab_labels||['Step 1','Step 2']).join(', ')} onChange={e=>property('tab_labels',e.target.value.split(',').map((v:string)=>v.trim()).filter(Boolean).slice(0,10))}/></label>}
 {node.parent_id&&['tabs','x-wizard'].includes(screen.nodes.find(n=>n.id===node.parent_id)?.type||'')&&<label>Assigned step<select aria-label="Assigned step" disabled={!canEdit} value={Number(node.props.tab_index)||0} onChange={e=>property('tab_index',Number(e.target.value))}>{(screen.nodes.find(n=>n.id===node.parent_id)?.props.tab_labels||['Step 1','Step 2']).map((v:string,i:number)=><option value={i} key={i}>{v}</option>)}</select></label>}
 {node.type==='x-accordion'&&<label>Expanded initially<input aria-label="Expanded initially" type="checkbox" disabled={!canEdit} checked={node.props.expanded!==false} onChange={e=>property('expanded',e.target.checked)}/></label>}
 {node.type==='x-splitter'&&<label>Split width (%)<input aria-label="Split width" type="number" min="10" max="90" disabled={!canEdit} value={Number(node.props.split_percent)||50} onChange={e=>property('split_percent',Math.max(10,Math.min(90,Number(e.target.value)||50)))}/></label>}
 {node.type==='x-kpi'&&<label>KPI value<input aria-label="KPI value" disabled={!canEdit} value={String(node.props.value||'')} onChange={e=>property('value',e.target.value)}/></label>}{['x','y','width','height'].map(k=><label key={k}>{k}<input type="number" value={Number(node.layout[k]||0)} onChange={e=>property(k,Number(e.target.value),'layout')} disabled={!canEdit}/></label>)}<label>Layout mode<select aria-label="Layout mode" disabled={!canEdit} value={node.layout.mode||'freeform'} onChange={e=>property('mode',e.target.value,'layout')}>{['freeform','flow','flex','grid'].map(v=><option key={v}>{v}</option>)}</select></label><label>Overflow X<select value={node.layout.overflow_x||'visible'} onChange={e=>property('overflow_x',e.target.value,'layout')}><option>visible</option><option>auto</option><option>scroll</option><option>hidden</option></select></label><label>Action<select value={node.action?.type||''} onChange={e=>edit(updateNode(doc,screen.id,node.id,n=>({...n,action:{...n.action,type:e.target.value}})))}><option value="">None</option>{['navigate','back','message','add_mock_row','show_modal','close_modal','toggle_container','collapse_container','expand_container'].map(x=><option key={x}>{x}</option>)}</select></label><label>Dataset<select value={node.action?.dataset_id||''} onChange={e=>edit(updateNode(doc,screen.id,node.id,n=>({...n,action:{...n.action,type:n.action?.type||'add_mock_row',dataset_id:e.target.value}})))}><option value="">Choose dataset</option>{doc.datasets.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}</select></label>{node?.type==='button'&&node.action?.type==='add_mock_row'&&<ActionRowEditor key={node.id+'-'+(node.action.dataset_id||'')} dataset={doc.datasets.find(d=>d.id===node.action?.dataset_id)} values={node.action?.values||{}} canEdit={canEdit} sources={screen.nodes.filter(n=>['input','select','checkbox','x-date','x-number','x-textarea'].includes(n.type))} bindings={node.action?.field_bindings||{}} onBindingsChange={field_bindings=>edit(updateNode(doc,screen.id,node.id,n=>({...n,action:{...n.action,type:'add_mock_row',field_bindings}})))} onChange={values=>edit(updateNode(doc,screen.id,node.id,n=>({...n,action:{...n.action,type:'add_mock_row',values}})))}/>}{node.type==='button'&&['toggle_container','collapse_container','expand_container'].includes(node.action?.type||'')&&
 <label>Target container<select aria-label="Target container" disabled={!canEdit} value={node.action?.target_node||''}
 onChange={e=>edit(updateNode(doc,screen.id,node.id,n=>({...n,action:{...n.action,type:n.action?.type||'toggle_container',target_node:e.target.value}})))}>
  <option value="">Choose container</option>{screen.nodes.filter(n=>COLLAPSIBLE_TYPES.has(n.type)).map(n=><option key={n.id} value={n.id}>{n.props.label||n.type} · {n.id.slice(0,8)}</option>)}
 </select></label>}
 {node&&COLLAPSIBLE_TYPES.has(node.type)&&<section className="collapse-properties">
 <h3>Collapse behaviour</h3>
 <label>Enable collapsible header<input aria-label="Enable collapsible header" type="checkbox" disabled={!canEdit} checked={!!node.props.collapsible} onChange={e=>property('collapsible',e.target.checked)}/></label>
 <label>Initially expanded<input aria-label="Initially expanded" type="checkbox" disabled={!canEdit} checked={node.props.expanded!==false} onChange={e=>property('expanded',e.target.checked)}/></label>
 </section>}
 <label>Target modal<select aria-label="Target modal" disabled={!canEdit} value={node.action?.target_node||''} onChange={e=>edit(updateNode(doc,screen.id,node.id,n=>({...n,action:{...n.action,type:"show_modal",target_node:e.target.value}})))}><option value="">Choose modal</option>{screen.nodes.filter(n=>n.type==="modal").map(n=><option key={n.id} value={n.id}>{n.props.label||n.id}</option>)}</select></label><label>Target screen<select value={node.action?.target_screen||''} onChange={e=>edit(updateNode(doc,screen.id,node.id,n=>({...n,action:{...n.action,type:'navigate',target_screen:e.target.value}})))}><option value="">Select</option>{doc.screens.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></>:<p>Select an object in design mode.</p>}{node?.type==='image'&&<label>Image file (PNG/JPEG/WebP/GIF)<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>{let file=e.target.files?.[0];if(file)onImageUpload(file,screen.id,node.id)}}/></label>}{node&&['x-diagram','x-schema-map','x-timeline','x-file-preview'].includes(node.type)&&<section className="advanced-object-settings">
 <h3>Advanced object settings</h3>
 {node.type==='x-timeline'&&<>
  <label>Timeline dataset<select aria-label="Timeline dataset" disabled={!canEdit} value={node.props.dataset_id||''} onChange={e=>property('dataset_id',e.target.value)}>
   <option value="">Select dataset</option>{doc.datasets.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}
  </select></label>
  {(['date_column','title_column'] as const).map(key=><label key={key}>{key.replace('_',' ')}
   <select aria-label={key} disabled={!canEdit} value={node.props[key]||''} onChange={e=>property(key,e.target.value)}>
    <option value="">Select field</option>{doc.datasets.find(d=>d.id===node.props.dataset_id)?.columns.map(field=><option key={field.id} value={field.id}>{field.id}</option>)}
   </select></label>)}
 </>}
 {node.type==='x-file-preview'&&<>
  <label>Accepted file types<input aria-label="Preview accepted file types" disabled={!canEdit} value={node.props.accept||''} onChange={e=>property('accept',e.target.value)}/></label>
  <label>Packaged image<select aria-label="Preview packaged image" disabled={!canEdit} value={node.props.asset||''} onChange={e=>property('asset',e.target.value)}>
   <option value="">Choose local file in Preview</option>{doc.assets.filter((a:any)=>a.path?.match(/\.(png|jpg|jpeg|webp|gif)$/i)).map((a:any)=><option key={a.path} value={a.path}>{a.path}</option>)}
  </select></label>
  <p className="muted">The browser previews selected local files without uploading them. For portability, select an already packaged image.</p>
 </>}
 {['x-diagram','x-schema-map'].includes(node.type)&&(()=>{
  const key=node.type==='x-schema-map'?'tables':'nodes';
  const nodes=Array.isArray(node.props[key])?node.props[key]:[];
  const links=Array.isArray(node.props.links)?node.props.links:[];
  return <div className="advanced-structure-editor">
   <h4>{node.type==='x-schema-map'?'Schema tables':'Diagram nodes'}</h4>
   {nodes.map((entry:any,i:number)=><div key={i} className="advanced-entry">
    <label>ID<input aria-label={'Advanced node ID '+i} disabled={!canEdit} value={entry.id||''} onChange={e=>property(key,nodes.map((v:any,j:number)=>j===i?{...v,id:e.target.value}:v))}/></label>
    <label>Label<input aria-label={'Advanced node label '+i} disabled={!canEdit} value={entry.label||''} onChange={e=>property(key,nodes.map((v:any,j:number)=>j===i?{...v,label:e.target.value}:v))}/></label>
    <label>X<input aria-label={'Advanced node X '+i} type="number" disabled={!canEdit} value={entry.x??0} onChange={e=>property(key,nodes.map((v:any,j:number)=>j===i?{...v,x:Number(e.target.value)}:v))}/></label>
    <label>Y<input aria-label={'Advanced node Y '+i} type="number" disabled={!canEdit} value={entry.y??0} onChange={e=>property(key,nodes.map((v:any,j:number)=>j===i?{...v,y:Number(e.target.value)}:v))}/></label>
    {key==='tables'&&<label>Fields (one per line)<textarea aria-label={'Advanced fields '+i} disabled={!canEdit} value={(entry.fields||[]).join('\n')} onChange={e=>property(key,nodes.map((v:any,j:number)=>j===i?{...v,fields:e.target.value.split('\n').filter(Boolean)}:v))}/></label>}
    <button type="button" disabled={!canEdit} onClick={()=>property(key,nodes.filter((_:any,j:number)=>j!==i))}>Remove node</button>
   </div>)}
   <button type="button" disabled={!canEdit} onClick={()=>property(key,[...nodes,{id:'node-'+crypto.randomUUID().slice(0,5),label:key==='tables'?'Table':'Node',x:25+(nodes.length%3)*175,y:45+Math.floor(nodes.length/3)*110,fields:key==='tables'?['ID']:undefined}])}>Add node</button>
   <h4>Connections</h4>
   {links.map((link:any,i:number)=><div key={i} className="advanced-entry">
    {(['source','target'] as const).map(field=><label key={field}>{field}<select aria-label={'Connection '+field+' '+i} disabled={!canEdit} value={link[field]||''} onChange={e=>property('links',links.map((v:any,j:number)=>j===i?{...v,[field]:e.target.value}:v))}><option value="">Choose node</option>{nodes.map((n:any)=><option key={n.id} value={n.id}>{n.label||n.id}</option>)}</select></label>)}
    <button type="button" disabled={!canEdit} onClick={()=>property('links',links.filter((_:any,j:number)=>j!==i))}>Remove link</button>
   </div>)}
   <button type="button" disabled={!canEdit||nodes.length<2} onClick={()=>property('links',[...links,{source:nodes[0].id,target:nodes[1].id}])}>Add connection</button>
  </div>;
 })()}
 </section>}
{node&&['x-menu','x-breadcrumbs'].includes(node.type)&&<section className="navigation-object-settings">
 <h3>Navigation settings</h3>
 {node.type==='x-menu'&&<>
  <label>Use shared menu items<input aria-label="Use shared menu items" type="checkbox" disabled={!canEdit} checked={node.props.use_shared!==false}
    onChange={e=>property('use_shared',e.target.checked)}/></label>
  {node.props.use_shared===false&&<>
   {(node.props.items||[]).map((item:any,i:number)=><div className="menu-item-property" key={item.id||i}>
    <label>Menu label {i+1}<input aria-label={'Menu item label '+i} disabled={!canEdit} value={item.label||''} onChange={e=>property('items',(node.props.items||[]).map((v:any,j:number)=>j===i?{...v,label:e.target.value}:v))}/></label>
    <label>Target screen {i+1}<select aria-label={'Menu item target '+i} disabled={!canEdit} value={item.target_screen||''}
     onChange={e=>property('items',(node.props.items||[]).map((v:any,j:number)=>j===i?{...v,target_screen:e.target.value}:v))}>
     <option value="">Group heading</option>{doc.screens.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
    </select></label>
    <button disabled={!canEdit} onClick={()=>property('items',(node.props.items||[]).filter((_:any,j:number)=>j!==i))}>Remove item</button>
   </div>)}
   <button disabled={!canEdit} onClick={()=>property('items',[...(node.props.items||[]),{id:'item-'+crypto.randomUUID().slice(0,8),label:'New link',target_screen:screen.id}])}>Add menu link</button>
  </>}
 </>}
 <p className="muted">Menu uses stable screen IDs. Breadcrumbs reflect Preview navigation history.</p>
 </section>}
{node&&['x-tree','x-list','x-pagination'].includes(node.type)&&<section className="data-extension-settings">
 <h3>Data object settings</h3>
 {node.type!=='x-pagination'?<>
  <label>Dataset<select aria-label="Extension dataset" disabled={!canEdit} value={node.props.dataset_id||''} onChange={e=>property('dataset_id',e.target.value)}><option value="">Select dataset</option>{doc.datasets.map(d=><option value={d.id} key={d.id}>{d.id}</option>)}</select></label>
  <label>Label column<select aria-label="Extension label column" disabled={!canEdit} value={node.props.label_column||''} onChange={e=>property('label_column',e.target.value)}><option value="">First column</option>{doc.datasets.find(d=>d.id===node.props.dataset_id)?.columns.map(column=><option key={column.id}>{column.id}</option>)}</select></label>
  {node.type==='x-tree'&&<>
   <label>Node ID column<select aria-label="Tree ID column" disabled={!canEdit} value={node.props.id_column||''} onChange={e=>property('id_column',e.target.value)}><option value="">First column</option>{doc.datasets.find(d=>d.id===node.props.dataset_id)?.columns.map(column=><option key={column.id}>{column.id}</option>)}</select></label>
   <label>Parent column<select aria-label="Tree parent column" disabled={!canEdit} value={node.props.parent_column||''} onChange={e=>property('parent_column',e.target.value)}><option value="">Select parent column</option>{doc.datasets.find(d=>d.id===node.props.dataset_id)?.columns.map(column=><option key={column.id}>{column.id}</option>)}</select></label>
  </>}
 </>:<label>Linked table/grid<select aria-label="Pagination target table" disabled={!canEdit} value={node.props.target_table_id||''} onChange={e=>property('target_table_id',e.target.value)}><option value="">Select table</option>{screen.nodes.filter(n=>['table','x-editable-grid'].includes(n.type)).map(n=><option key={n.id} value={n.id}>{n.props.label||n.type} · {n.id.slice(0,8)}</option>)}</select></label>}
 <small className="muted">Selections operate on mock dataset rows; pagination uses the target table's page size.</small>
 </section>}
 {node?.type==='x-record-detail'&&<section className="record-detail-configuration">
 <h3>Record detail settings</h3>
 <label>Linked dataset<select aria-label="Detail dataset" disabled={!canEdit} value={node.props.dataset_id||''}
 onChange={e=>edit(updateNode(doc,screen.id,node.id,n=>({...n,props:{...n.props,dataset_id:e.target.value,source_table_id:''}})))}>
  <option value="">Select dataset</option>{doc.datasets.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}
 </select></label>
 <label>Source table / grid<select aria-label="Detail source table" disabled={!canEdit} value={node.props.source_table_id||''}
 onChange={e=>property('source_table_id',e.target.value)}>
  <option value="">Any table using dataset</option>
  {screen.nodes.filter(n=>['table','x-editable-grid'].includes(n.type)&&n.props.dataset_id===node.props.dataset_id)
   .map(n=><option key={n.id} value={n.id}>{n.props.label||n.type} · {n.id.slice(0,8)}</option>)}
 </select></label>
 <label>Allow mock editing<input aria-label="Allow detail editing" type="checkbox" disabled={!canEdit} checked={!!node.props.editable}
 onChange={e=>property('editable',e.target.checked)}/></label>
 <p className="muted">Click a table row in Preview to display its details. Editing works only on seed-reset datasets.</p>
 </section>}
 {(node?.type==='table'||node?.type==='x-editable-grid')&&<section className="table-configuration">
 <h3>Table / grid behaviour</h3>
 {(['searchable','sortable','selectable'] as const).map(key=><label key={key}><input type="checkbox" aria-label={'Enable '+key} disabled={!canEdit} checked={Boolean(node.props[key])} onChange={e=>property(key,e.target.checked)}/>{key}</label>)}
 <label>Page size (0 = all)<input aria-label="Page size" type="number" min="0" max="100" disabled={!canEdit} value={Number(node.props.page_size)||0} onChange={e=>property('page_size',Math.max(0,Math.min(100,Number(e.target.value)||0)))}/></label>
 <label>Filter column<select aria-label="Filter column" disabled={!canEdit} value={node.props.filter_column||''} onChange={e=>property('filter_column',e.target.value)}><option value="">None</option>{doc.datasets.find(d=>d.id===node.props.dataset_id)?.columns.map(c=><option key={c.id} value={c.id}>{c.id}</option>)}</select></label>
 <label>Filter contains<input aria-label="Filter contains" disabled={!canEdit} value={String(node.props.filter_value||'')} onChange={e=>property('filter_value',e.target.value)}/></label><h3>Table dataset</h3><label>Dataset<select aria-label="Table dataset" disabled={!canEdit} value={node.props.dataset_id||''} onChange={e=>property('dataset_id',e.target.value)}><option value="">Select dataset</option>{doc.datasets.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}</select></label>{doc.datasets.find(d=>d.id===node.props.dataset_id)?<TableDataEditor dataset={doc.datasets.find(d=>d.id===node.props.dataset_id)!} canEdit={canEdit} onChange={d=>edit(updateDataset(doc,d))}/>:<button type="button" disabled={!canEdit} onClick={()=>{const updated=withTableDataset(doc,{...node,props:{...node.props,dataset_id:''}});const withNode=updateNode(updated.document,screen.id,node.id,()=>updated.node);edit(withNode)}}>Create sample dataset</button>}</section>}<h3>Theme tokens ({theme})</h3>{Object.entries(doc.themes[theme]?.tokens||{}).map(([key,val])=><label key={key}>{key}<input value={val} onChange={e=>edit({...doc,themes:{...doc.themes,[theme]:{tokens:{...doc.themes[theme].tokens,[key]:e.target.value}}}})}/></label>)}<h3>Viewport</h3><label>Width<input type="number" value={screen.viewport.width} onChange={e=>edit({...doc,screens:doc.screens.map(s=>s.id===screen.id?{...s,viewport:{...s.viewport,width:Number(e.target.value)}}:s)})}/></label><label>Height<input type="number" value={screen.viewport.height} onChange={e=>edit({...doc,screens:doc.screens.map(s=>s.id===screen.id?{...s,viewport:{...s.viewport,height:Number(e.target.value)}}:s)})}/></label></aside></div>
}
export default function App(){
 const [isAdmin,setIsAdmin]=useState(false),[repoOwner,setRepoOwner]=useState('zageabb'),[repoName,setRepoName]=useState(''),[repoPath,setRepoPath]=useState('design/screencraft/application.scraft'),[repoRef,setRepoRef]=useState('main'),[invite,setInvite]=useState(''),[inviteRole,setInviteRole]=useState('viewer'),[newAccount,setNewAccount]=useState(''),[newPassword,setNewPassword]=useState('');
 const [authMode,setAuthMode]=useState<'loading'|'local'|'uda'>('loading');
 const [importReport,setImportReport]=useState<{name:string;format_version:string;screen_count:number;warnings:string[];asset_count:number}|null>(null);
 const [importFile,setImportFile]=useState<File|null>(null);
 const [importBusy,setImportBusy]=useState(false);
 const [user,setUser]=useState(''),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[setupKey,setSetupKey]=useState(''),[error,setError]=useState(''),[projects,setProjects]=useState<Project[]>([]),[project,setProject]=useState<Project|null>(null),[doc,setDoc]=useState<Document>(cloneDoc(blank)),[name,setName]=useState('New Application');
 const savedDocument=useRef<{projectId:string;json:string}|null>(null);
 const [downloadBusy,setDownloadBusy]=useState(false);
 async function refresh(){try{const x=await request('/api/projects');setProjects(x.projects)}catch(e){setError(String(e))}}
 useEffect(()=>{request('/api/auth-mode').then(async x=>{
   const mode=x.mode==='uda'?'uda':'local';
   setAuthMode(mode);
   try{const me=await request('/api/me');setUser(me.username);setIsAdmin(!!me.is_admin);await refresh()}
   catch(e){if(mode==='uda')setError(String(e))}
 }).catch(e=>{setAuthMode('local');setError(String(e))})},[]);
 async function login(path:string){try{setError('');const result=await request(path,{method:'POST',body:JSON.stringify({username,password,setup_key:setupKey})});setUser(result.username);setIsAdmin(!!result.is_admin);refresh()}catch(e){setError(String(e))}}
 async function open(p:Project){try{const r=await request('/api/projects/'+p.id);savedDocument.current={projectId:p.id,json:JSON.stringify(r.document)};setDoc(r.document);setProject({...p,revision:r.revision,role:r.role});setError('')}catch(e){setError(String(e))}}
 async function create(){try{const r=await request('/api/projects',{method:'POST',body:JSON.stringify({name})});await refresh();await open({id:r.id,name,revision:r.revision,role:'owner'})}catch(e){setError(String(e))}}
 async function save(){if(!project)return;try{
  const serialized=JSON.stringify(doc);
  const r=await request('/api/projects/'+project.id,{method:'PUT',body:JSON.stringify({document:doc,revision:project.revision})});
  savedDocument.current={projectId:project.id,json:serialized};
  setProject({...project,revision:r.revision});setError('Saved revision '+r.revision)
 }catch(e){setError(String(e))}}
 async function downloadScraft(){
  if(!project||downloadBusy)return;
  setDownloadBusy(true);
  const selectedProject=project;
  try{
   const serialized=JSON.stringify(doc);
   // The download endpoint serves a stored ZIP: save pending edits first.
   // Avoid changing the project revision when no edits have been made.
   const isSaved=savedDocument.current?.projectId===selectedProject.id&&
     savedDocument.current.json===serialized;
   if(!isSaved){
    if(selectedProject.role==='viewer')throw Error('Unsaved design cannot be exported with viewer access.');
    const result=await request('/api/projects/'+selectedProject.id,{
      method:'PUT',body:JSON.stringify({document:doc,revision:selectedProject.revision})
    });
    savedDocument.current={projectId:selectedProject.id,json:serialized};
    setProject(p=>p?.id===selectedProject.id?{...p,revision:result.revision}:p);
   }
   setError('');
   download('/api/projects/'+selectedProject.id+'/download');
  }catch(e){setError('Download .scraft failed: '+String(e))}
  finally{setDownloadBusy(false)}
 }
 async function imageUpload(file:File,screenId:string,nodeId:string){if(!project)return;try{const data=new FormData();data.append('file',file);data.append('revision',String(project.revision));data.append('screen_id',screenId);data.append('node_id',nodeId);const resp=await fetch(apiUrl('/api/projects/'+project.id+'/images'),{method:'POST',body:data,credentials:'same-origin'});const result=await resp.json();if(!resp.ok)throw Error(result.error||'Image upload failed');setProject({...project,revision:result.revision});setDoc(v=>{const assets=[...v.assets.filter(a=>a.path!==result.path),{id:result.sha256.slice(0,16),path:result.path,media_type:file.type,sha256:result.sha256}];return updateNode({...v,assets},screenId,nodeId,n=>({...n,props:{...n.props,asset:result.path}}))});setError('Image added to .scraft document')}catch(e){setError(String(e))}}
 async function inspectImport(file:File){
   if(!project)return;
   setImportFile(null);setImportReport(null);setImportBusy(true);
   try{
     const form=new FormData();form.append('file',file);
     const response=await fetch(apiUrl('/api/scraft/inspect'),{method:'POST',body:form,credentials:'same-origin'});
     const result=await response.json();
     if(!response.ok)throw Error(result.error||'Invalid .scraft document');
     setImportFile(file);setImportReport(result);setError('');
   }catch(e){setError('Import validation failed: '+String(e))}
   finally{setImportBusy(false)}
 }
 async function confirmImport(){
   if(!project||!importFile)return;
   setImportBusy(true);
   try{
     const form=new FormData();form.append('file',importFile);form.append('revision',String(project.revision));
     const response=await fetch(apiUrl('/api/projects/'+project.id+'/upload'),{method:'POST',body:form,credentials:'same-origin'});
     const result=await response.json();
     if(!response.ok)throw Error(result.error||'Import failed');
     setImportReport(null);setImportFile(null);
     await open({...project,revision:result.revision});
     setError(result.warnings?.length?'Imported with '+result.warnings.length+' compatibility warning(s).':'Validated .scraft imported successfully');
   }catch(e){setError('Import failed: '+String(e))}
   finally{setImportBusy(false)}
 }
 async function githubPull(){if(!project)return;if(!window.confirm('Replace the current project design with the GitHub .scraft file?'))return;try{const x=await request('/api/projects/'+project.id+'/github-pull',{method:'POST',body:JSON.stringify({owner:repoOwner,repo:repoName,path:repoPath,ref:repoRef,revision:project.revision})});await open({...project,revision:x.revision});setError('Imported repository revision')}catch(e){setError(String(e))}}
 async function githubPR(){if(!project)return;try{const x=await request('/api/projects/'+project.id+'/github-pr',{method:'POST',body:JSON.stringify({owner:repoOwner,repo:repoName,path:repoPath,base:repoRef})});setError('Design pull request created: '+x.url)}catch(e){setError(String(e))}}
 async function addMember(){if(!project)return;try{await request('/api/projects/'+project.id+'/members',{method:'POST',body:JSON.stringify({username:invite,role:inviteRole})});setError('Member permissions saved')}catch(e){setError(String(e))}}
 async function addAccount(){try{await request('/api/users',{method:'POST',body:JSON.stringify({username:newAccount,password:newPassword})});setError('User created');setNewPassword('')}catch(e){setError(String(e))}}
 function download(path:string){window.location.href=apiUrl(path)}
 if(authMode==='loading')return <div className="login"><h1>ScreenCraft</h1><p>Checking authentication...</p></div>;
 if(!user&&authMode==='uda')return <div className="login"><h1>ScreenCraft</h1><p>Sign in through UDA to access ScreenCraft.</p><p className="muted">No separate ScreenCraft password is required. Your UDA account must be authorised to access this application.</p>{error&&<p role="alert" className="error">{error}</p>}<button onClick={()=>window.location.reload()}>Retry UDA sign-in</button></div>;
 if(!user)return <div className="login"><h1>ScreenCraft</h1><p>Local-first visual application prototyping</p><label>Username<input value={username} onChange={e=>setUsername(e.target.value)}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button onClick={()=>login('/api/login')}>Sign in</button><details><summary>First-time setup</summary><label>Setup key<input type="password" value={setupKey} onChange={e=>setSetupKey(e.target.value)}/></label><button onClick={()=>login('/api/bootstrap')}>Initialize administrator</button></details>{error&&<p className="error">{error}</p>}</div>;
 return <><header className="appheader"><strong>ScreenCraft</strong><span className="muted">Visual application designer</span><span className="spacer"/><span>{user}</span>{authMode==='local'&&<button onClick={async()=>{await request('/api/logout',{method:'POST'});setUser('');setIsAdmin(false);setProject(null)}}>Sign out</button>}</header>{!project?<div className="project-list"><h2>Applications</h2><label>New application name <input value={name} onChange={e=>setName(e.target.value)}/></label><button onClick={create}>Create application</button>{isAdmin&&authMode==='local'&&<details><summary>Provision user</summary><label>Username<input value={newAccount} onChange={e=>setNewAccount(e.target.value)}/></label><label>Password<input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label><button onClick={addAccount}>Create user</button></details>}{projects.map(p=><div key={p.id} className="project-card"><strong>{p.name}</strong><span>Revision {p.revision} · {p.role}</span><button onClick={()=>open(p)}>Open</button></div>)}</div>:<><div className="project-bar"><button onClick={()=>{setProject(null);refresh()}}>← Projects</button><strong>{project.name}</strong><span>Revision {project.revision} · {project.role}</span><button disabled={downloadBusy||importBusy} onClick={()=>void downloadScraft()}>{downloadBusy?'Preparing .scraft…':'Download .scraft'}</button><label>Import .scraft<input type="file" aria-label="Choose .scraft file" accept=".scraft" disabled={importBusy||project.role==='viewer'} onChange={e=>{const file=e.target.files?.[0];if(file)void inspectImport(file);e.currentTarget.value=''}}/></label></div>{importReport&&<section className="scraft-preflight" role="region" aria-label="Import validation results"><h3>Import validation — compatible</h3><p><strong>{importReport.name}</strong> · v{importReport.format_version} · {importReport.screen_count} screen(s) · {importReport.asset_count} asset(s)</p>{importReport.warnings.length?<><p>Compatibility warnings (review before replacing this application):</p><ul>{importReport.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></>:<p>No compatibility warnings.</p>}<p>This will replace the current application's design. Your existing project permissions remain unchanged.</p><button disabled={importBusy} onClick={confirmImport}>Import validated design</button><button disabled={importBusy} onClick={()=>{setImportReport(null);setImportFile(null)}}>Cancel import</button></section>}<details className="integration-panel"><summary>GitHub repository design / Project sharing</summary><div className="integration-grid"><label>Owner<input value={repoOwner} onChange={e=>setRepoOwner(e.target.value)}/></label><label>Repository<input value={repoName} onChange={e=>setRepoName(e.target.value)}/></label><label>Path<input value={repoPath} onChange={e=>setRepoPath(e.target.value)}/></label><label>Branch<input value={repoRef} onChange={e=>setRepoRef(e.target.value)}/></label><button disabled={!isAdmin||!repoName||project.role==='viewer'} onClick={githubPull}>Import repo design</button><button disabled={!isAdmin||!repoName||project.role==='viewer'} onClick={githubPR}>Create design PR</button>{(project.role==='owner'||project.role==='admin')&&<><label>Share with user<input value={invite} onChange={e=>setInvite(e.target.value)}/></label><label>Role<select value={inviteRole} onChange={e=>setInviteRole(e.target.value)}><option>viewer</option><option>designer</option><option>admin</option></select></label><button onClick={addMember}>Share project</button></>}</div><p className="muted">GitHub import and PR save require server administrator rights and a repo allowlist. Save changes before creating a PR.</p></details><Editor key={project.id} projectId={project.id} doc={doc} setDoc={setDoc} onSave={save} onExport={()=>download('/api/projects/'+project.id+'/export/html')} onImageUpload={imageUpload} canEdit={project.role!=='viewer'}/></>}{error&&<div className="status" onClick={()=>setError('')}>{error} ×</div>}</>
}
