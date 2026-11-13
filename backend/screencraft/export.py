"""Standalone offline prototype HTML exporter with restricted declarative actions."""
import html
import json
import base64
import mimetypes
from .package import _validate, FormatError

def interactive_html(app: dict, assets: dict | None = None) -> str:
    _validate({"format":"screencraft","format_version":"1.0.0","entry":"application.json"}, app)
    payload=json.dumps(app,ensure_ascii=True,separators=(",",":")).replace("<","\\u003c").replace(">","\\u003e").replace("&","\\u0026")
    import hashlib
    images={}
    for path, content in (assets or {}).items():
        mime=mimetypes.guess_type(path)[0] or "application/octet-stream"
        images[path]="data:"+mime+";base64,"+base64.b64encode(content).decode("ascii")
    asset_payload=json.dumps(images,ensure_ascii=True).replace("<","\\u003c").replace(">","\\u003e").replace("&","\\u0026")
    title=html.escape(str(app.get("name","ScreenCraft Prototype")),quote=True)
    return """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>"""+title+"""</title><style>
:root{font-family:system-ui,sans-serif;color:#172033;background:#f5f7fa}body{margin:0}header{padding:12px 20px;background:#24344f;color:white;display:flex;gap:12px;align-items:center}main{padding:16px;max-width:100%;overflow:auto;min-height:70vh}button,input,select{font:inherit;padding:8px;margin:4px;max-width:100%}button{cursor:pointer;border:1px solid #aac0d9;border-radius:6px}table{border-collapse:collapse;min-width:100%;background:white}td,th{padding:9px;border:1px solid #dce1e8;white-space:nowrap}section{position:relative;overflow:auto}.sc-node{box-sizing:border-box} .sc-table{max-width:100%;overflow:auto}.sc-table-scroll{overflow:auto;max-width:100%}.sc-data-grid-actions,.sc-data-grid-pages{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.sc-data-grid .selected-row{background:#e8f1ff}.sc-data-grid td input{min-width:80px;max-width:180px}.sc-data-grid th button{font-weight:600}.sc-modal{background:white;border:2px solid #789;border-radius:8px;padding:16px;position:fixed;top:25%;left:25%;width:50%;z-index:10;box-shadow:0 0 0 100vmax #0006} .sc-notice{padding:8px;background:#def;border-radius:4px} .sc-menu{display:flex;gap:4px;flex-wrap:wrap}.sc-box{border:1px dashed #859ab0;background:#f6f8fc;padding:6px;min-height:70px}.sc-card{background:white;border:1px solid #cbd5e1;border-radius:7px;box-shadow:0 2px 7px #0001}.sc-kpi{display:flex;flex-direction:column;border:1px solid #ddd;border-radius:7px;padding:8px;background:#edf2fa}.sc-kpi strong{font-size:24px}.sc-chart{display:flex;flex-direction:column;gap:4px;width:100%;height:100%;overflow:auto}.sc-chart svg{width:100%;height:65%;min-height:110px}.sc-chart-legend{display:flex;flex-wrap:wrap;gap:6px;font-size:11px}.sc-chart-legend span{display:inline-flex;align-items:center;gap:3px}.sc-chart-legend i{display:inline-block;width:9px;height:9px;border-radius:2px}.sc-panel-container{border:1px solid #cbd5e1;background:white;min-height:100%;padding:6px}.sc-panel-nav,.sc-wizard-buttons{display:flex;gap:5px;flex-wrap:wrap}.sc-panel-nav button[aria-pressed="true"]{background:#cbdff9}.sc-panel-content{position:relative;min-height:100px}.sc-accordion{background:white;border:1px solid #cbd5e1;min-height:55px}.sc-accordion>button{width:100%;text-align:left}.sc-accordion-content{position:relative;min-height:50px}.sc-layout-content{position:relative;min-height:80%;height:calc(100% - 25px)}.sc-unsupported{border:1px dashed #b77d45;color:#875023;background:#fff6eb;padding:7px}
.sc-shared-layout{display:flex;min-width:0}.sc-shared-layout.nav-layout-right{flex-direction:row-reverse}.sc-shared-layout.nav-layout-top{flex-direction:column}.sc-screen-content{flex:1;min-width:0}.sc-shared-nav{display:flex;flex-direction:column;flex:0 0 190px;max-width:240px;background:#e9f1fc;border-right:1px solid #c1cfe0;padding:6px;gap:4px}.sc-shared-nav.nav-right{border-right:0;border-left:1px solid #c1cfe0}.sc-shared-nav.nav-top{flex:0 0 auto;max-width:none;flex-direction:row;align-items:center}.sc-shared-nav.nav-top .sc-shared-nav-items{display:flex;gap:4px;flex-wrap:wrap}.sc-shared-nav.is-collapsed:not(.nav-top){flex-basis:46px}.sc-shared-nav-row{display:flex;gap:4px}.sc-shared-nav-row button:first-child{flex:1;min-width:0;text-align:left}.sc-shared-nav-row .is-active{background:#bad7ff;font-weight:700}.sc-shared-nav-children{padding-left:11px;border-left:1px solid #b0bfd1}.sc-shared-nav-controls{display:flex;gap:4px}.sc-mobile-nav-toggle{display:none}.sc-collapse-header{display:flex;justify-content:space-between;align-items:center;min-height:26px}.sc-collapse-header button{padding:2px 8px}.sc-box.is-collapsed{min-height:40px!important;max-height:40px;overflow:hidden}@media(max-width:700px){.sc-shared-layout{flex-direction:column!important}.sc-shared-nav{max-width:none;width:100%;flex:0 0 auto;box-sizing:border-box}.sc-mobile-nav-toggle{display:inline-flex}.sc-shared-nav:not(.mobile-open) .sc-shared-nav-items{display:none}.sc-shared-nav.nav-top{flex-direction:column;align-items:stretch}.sc-shared-nav.nav-top .sc-shared-nav-items{display:block}}.sc-record-detail{display:flex;flex-direction:column;gap:7px;background:#fff;border:1px solid #ccd7e6;padding:8px;overflow:auto}.sc-record-detail h4{margin:0 0 4px}.sc-record-field{display:flex;flex-direction:column;gap:2px;font-size:12px}.sc-record-field output{padding:6px;background:#f4f7fc;min-height:18px}.sc-record-field input{box-sizing:border-box;width:100%;margin:0}.sc-data-grid tbody tr{cursor:pointer}.sc-data-extension{overflow:auto;padding:7px;border:1px solid #cbd5e1;background:#fff;height:100%;box-sizing:border-box}.sc-data-extension ul{list-style:none;margin:4px 0;padding-left:14px}.sc-data-extension li{margin:3px 0}.sc-tree-row{display:flex;gap:4px;align-items:center}.sc-data-extension button[aria-pressed='true']{background:#d8eaff;font-weight:700}.sc-pagination{display:flex;gap:6px;align-items:center;justify-content:center}.sc-pagination button:disabled{opacity:.5}.sc-local-menu,.sc-breadcrumbs{background:#fff;border:1px solid #ccd5e3;padding:6px;overflow:auto}.sc-local-menu ul{list-style:none;margin:5px 0;padding-left:13px}.sc-menu-row{display:flex;gap:3px}.sc-menu-row button:first-child{flex:1;text-align:left}.sc-local-menu [aria-current='page'],.sc-breadcrumbs [aria-current='page']{background:#d9eafb;font-weight:700}.sc-breadcrumbs{display:flex;align-items:center;gap:4px;flex-wrap:wrap}.sc-advanced-diagram,.sc-advanced-timeline,.sc-advanced-file-preview{box-sizing:border-box;width:100%;height:100%;overflow:auto;background:#fff;border:1px solid #c7d4e4;padding:7px}.sc-diagram-tools{display:flex;align-items:center;gap:6px}.sc-diagram-tools strong{flex:1}.sc-diagram-scroller{overflow:auto}.sc-diagram-scroller svg{width:100%;min-height:170px;max-height:350px}.sc-advanced-timeline ol{padding-left:22px}.sc-advanced-timeline li{margin:8px 0}.sc-advanced-file-preview{display:flex;flex-direction:column;gap:7px}.sc-advanced-file-preview img{max-width:100%;max-height:70%;object-fit:contain}.sc-advanced-file-preview iframe{width:100%;min-height:160px}.sc-advanced-file-preview pre{white-space:pre-wrap;overflow:auto;word-break:break-word}
/* ScreenCraft semantic canvas palette: applied only to prototype surfaces, not the editor chrome. */
.canvas.sc-theme,.sc-theme{--sc-page:#fff;--sc-surface:#fff;--sc-nav:#e9f1fc;--sc-text:#172033;--sc-muted:#52647b;--sc-border:#cbd5e1;--sc-accent:#2563eb;--sc-field:#fff;--sc-field-text:#172033;--sc-selected:#dbeafe;--sc-disabled:#64748b;color:var(--sc-text);color-scheme:var(--sc-color-scheme,light)}
.canvas.sc-theme .canvas-node,.sc-theme .sc-node{color:inherit}
.canvas.sc-theme .kpi-tile,.sc-theme .sc-kpi{background:var(--sc-surface);border-color:var(--sc-border);color:var(--sc-text)}
.canvas.sc-theme .kpi-tile small,.sc-theme .sc-kpi small{color:var(--sc-muted)}
.canvas.sc-theme .container-outline,.canvas.sc-theme .sc-card,.canvas.sc-theme .sc-panel-container,.canvas.sc-theme .sc-accordion,.canvas.sc-theme .sc-record-detail,.canvas.sc-theme .sc-data-extension,.canvas.sc-theme .sc-local-menu,.canvas.sc-theme .sc-breadcrumbs,.canvas.sc-theme .sc-advanced-diagram,.canvas.sc-theme .sc-advanced-timeline,.canvas.sc-theme .sc-advanced-file-preview,
.sc-theme .sc-box,.sc-theme .sc-card,.sc-theme .sc-panel-container,.sc-theme .sc-accordion,.sc-theme .sc-record-detail,.sc-theme .sc-data-extension,.sc-theme .sc-local-menu,.sc-theme .sc-breadcrumbs,.sc-theme .sc-advanced-diagram,.sc-theme .sc-advanced-timeline,.sc-theme .sc-advanced-file-preview{background:var(--sc-surface);color:var(--sc-text);border-color:var(--sc-border)}
.canvas.sc-theme table,.sc-theme table{background:var(--sc-surface);color:var(--sc-text)}
.canvas.sc-theme th,.canvas.sc-theme td,.sc-theme th,.sc-theme td{border-color:var(--sc-border);color:var(--sc-text)}
.canvas.sc-theme th,.sc-theme th{background:var(--sc-surface);font-weight:600}
.canvas.sc-theme input:not([type=checkbox]):not([type=radio]):not([type=file]),.canvas.sc-theme select,.canvas.sc-theme textarea,
.sc-theme input:not([type=checkbox]):not([type=radio]):not([type=file]),.sc-theme select,.sc-theme textarea{background:var(--sc-field);color:var(--sc-field-text);border:1px solid var(--sc-border);border-radius:5px}
.canvas.sc-theme input::placeholder,.canvas.sc-theme textarea::placeholder,.sc-theme input::placeholder,.sc-theme textarea::placeholder{color:var(--sc-muted);opacity:1}
.canvas.sc-theme input[type=checkbox],.canvas.sc-theme input[type=radio],.sc-theme input[type=checkbox],.sc-theme input[type=radio]{accent-color:var(--sc-accent)}
.canvas.sc-theme button:not(.prototype-button),.sc-theme button{background:var(--sc-surface);color:var(--sc-text);border:1px solid var(--sc-border)}
.canvas.sc-theme .prototype-button,.sc-theme .sc-node > button{background:var(--sc-accent);color:var(--sc-accent-text,#fff)}
.canvas.sc-theme button:disabled,.sc-theme button:disabled{opacity:1;color:var(--sc-disabled);background:var(--sc-surface);cursor:not-allowed}
.canvas.sc-theme button:focus-visible,.canvas.sc-theme input:focus-visible,.canvas.sc-theme select:focus-visible,.sc-theme button:focus-visible,.sc-theme input:focus-visible,.sc-theme select:focus-visible{outline:2px solid var(--sc-accent);outline-offset:2px}
.canvas.sc-theme .selected-row,.sc-theme .selected-row,.sc-theme .sc-data-grid .selected-row{background:var(--sc-selected)}
.sc-theme .sc-shared-nav{background:var(--sc-nav);color:var(--sc-text);border-color:var(--sc-border)}
.sc-theme .sc-shared-nav button{background:transparent;color:var(--sc-text);border-color:var(--sc-border)}
.sc-theme .sc-shared-nav-row .is-active{background:var(--sc-selected);color:var(--sc-text)}
.sc-theme .sc-record-field output{background:var(--sc-field);color:var(--sc-field-text)}

/* Shared navigation lives outside the canvas but inherits the same project theme. */
.shared-preview-layout.sc-theme .shared-app-nav{background:var(--sc-nav);color:var(--sc-text);border-color:var(--sc-border)}
.shared-preview-layout.sc-theme .shared-app-nav button{background:transparent;color:var(--sc-text);border-color:var(--sc-border)}
.shared-preview-layout.sc-theme .shared-app-nav button.is-active{background:var(--sc-selected);color:var(--sc-text)}
</style></head><body><header><strong id="title"></strong><nav class="sc-menu" id="menu"></nav><small>Interactive prototype — no production actions</small></header><main id="root"></main><script type="application/json" id="sc-document">"""+payload+"""</script><script type="application/json" id="sc-assets">"""+asset_payload+"""</script><script>
'use strict';
const app=JSON.parse(document.getElementById('sc-document').textContent);
const assetUris=JSON.parse(document.getElementById('sc-assets').textContent);
const screens=Object.fromEntries(app.screens.map(s=>[s.id,s]));
const screenList=(app.screen_order||app.screens.map(s=>s.id)).map(id=>screens[id]).filter(Boolean);
let active=app.start_screen,history=[],modal=null,message='',theme=app.default_theme||'light';
function applyTheme(){
 const t=app.themes?.[theme]?.tokens||{},dark=String(theme).toLowerCase().includes('dark');
 const values={
 '--sc-page':t['surface.page']||t['surface.default']||(dark?'#101827':'#fff'),
 '--sc-surface':t['surface.default']||(dark?'#1E293B':'#fff'),
 '--sc-nav':t['surface.nav']||(dark?'#0B1220':'#e9f1fc'),
 '--sc-text':t['text.primary']||(dark?'#F1F5F9':'#172033'),
 '--sc-muted':t['text.secondary']||(dark?'#94A3B8':'#52647b'),
 '--sc-border':t['border.default']||(dark?'#334155':'#cbd5e1'),
 '--sc-accent':t['action.primary']||'#2563eb',
 '--sc-accent-text':t['action.on_primary']||(dark?'#0B1220':'#fff'),
 '--sc-field':t['surface.input']||t['surface.default']||(dark?'#1E293B':'#fff'),
 '--sc-field-text':t['text.primary']||(dark?'#F1F5F9':'#172033'),
 '--sc-selected':t['surface.selected']||(dark?'#263F66':'#dbeafe'),
 '--sc-disabled':t['text.disabled']||(dark?'#94A3B8':'#64748b'),
 '--sc-color-scheme':dark?'dark':'light'
 };
 root.classList.add('sc-theme');for(const [k,v] of Object.entries(values))root.style.setProperty(k,v);
 root.style.background=values['--sc-page'];root.style.color=values['--sc-text'];
}
function applyNodeStyle(node,element){
 const style=node.style||{},tokens=app.themes?.[theme]?.tokens||{};
 for(const [key,cssKey] of [['color','color'],['background_color','backgroundColor'],['border_color','borderColor']]){
 const value=style[key+'_token']?tokens[style[key+'_token']]:style[key];
 if(typeof value==='string'&&value)element.style[cssKey]=value;
 }
}
const containerStates=Object.create(null);
let navCollapsed=Boolean(app.shared_navigation?.initial_collapsed);
let mobileOpen=!app.shared_navigation?.mobile_collapsed;
const navExpanded=new Set();
const collapsibleTypes=new Set(['container','x-card','x-grid','x-flex','x-toolbar','x-sidebar','x-splitter']);
let datasets=Object.fromEntries((app.datasets||[]).map(d=>[d.id,structuredClone(d.rows||[])]));
const inputValues=Object.create(null);
const SUPPORTED_INPUTS=new Set(['input','select','checkbox','x-date','x-number','x-textarea','x-time','x-radio','x-toggle','x-file-upload','x-search']);
function selectValue(option){return typeof option==='string'?option:(option&&typeof option==='object'?(option.value??option.label??''):'')}
function resolveActionRow(action,screen){
 const row={...(action.values||{})};
 const sources=new Map((screen?.nodes||[]).filter(n=>SUPPORTED_INPUTS.has(n.type)).map(n=>[n.id,n]));
 for(const [column,id] of Object.entries(action.field_bindings||{})){
  if(!id)continue;
  const source=sources.get(id);
  if(!source)continue;
  const options=source.props?.options||[];
  row[column]=Object.prototype.hasOwnProperty.call(inputValues,id)
   ?inputValues[id]
   :['checkbox','x-toggle'].includes(source.type)?false:
    source.type==='select'?selectValue(options[0]??''):
    (source.props?.value??'');
 }
 return row;
}
function validateBoundInputs(action,screen){
 const errors=[];
 for(const [column,id] of Object.entries(action.field_bindings||{})){
  if(!id)continue;
  const source=(screen?.nodes||[]).find(n=>n.id===id&&SUPPORTED_INPUTS.has(n.type));if(!source)continue;
  const p=source.props||{},label=String(p.label||p.placeholder||column);
  const fallback=['checkbox','x-toggle'].includes(source.type)?false:source.type==='select'?selectValue((p.options||[])[0]??''):p.value??'';
  const value=Object.prototype.hasOwnProperty.call(inputValues,id)?inputValues[id]:fallback;
  const text=String(value??'');
  if(p.required&&(['checkbox','x-toggle'].includes(source.type)?value!==true:!text.trim())){errors.push(label+' is required');continue}
  if(!text.trim()&&!['checkbox','x-toggle'].includes(source.type))continue;
  if(['input','x-textarea'].includes(source.type)){
   if(p.min_length!==undefined&&Number.isInteger(Number(p.min_length))&&text.length<Number(p.min_length))errors.push(label+' needs at least '+p.min_length+' characters');
   if(p.max_length!==undefined&&Number.isInteger(Number(p.max_length))&&text.length>Number(p.max_length))errors.push(label+' cannot exceed '+p.max_length+' characters');
  }
  if(source.type==='x-number'){
   const number=Number(text);
   if(!Number.isFinite(number)){errors.push(label+' must be a number');continue}
   if(p.min!==undefined&&p.min!==''&&number<Number(p.min))errors.push(label+' must be at least '+p.min);
   if(p.max!==undefined&&p.max!==''&&number>Number(p.max))errors.push(label+' cannot exceed '+p.max);
  }
  if((source.type==='x-date'&&/^\\d{4}-\\d\\d-\\d\\d$/.test(text))||(source.type==='x-time'&&/^\\d\\d:\\d\\d$/.test(text))){
   if(p.min&&text<String(p.min))errors.push(label+' cannot be before '+p.min);
   if(p.max&&text>String(p.max))errors.push(label+' cannot be after '+p.max);
  }
 }
 return errors;
}
function captureInput(node,control,kind){
 const id=node.id;
 const read=()=>kind==='checkbox'?control.checked:control.value;
 control.addEventListener(kind==='checkbox'?'change':'input',()=>{inputValues[id]=read()});
 if(kind==='select')control.addEventListener('change',()=>{inputValues[id]=read()});
 if(Object.prototype.hasOwnProperty.call(inputValues,id)){
  if(kind==='checkbox')control.checked=Boolean(inputValues[id]);
  else control.value=String(inputValues[id]??'');
 }else{
  inputValues[id]=read();
 }
}
const root=document.getElementById('root'),menu=document.getElementById('menu');
document.getElementById('title').textContent=app.name||'Prototype';
function el(tag,text){const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);return x}
function action(a){if(!a||!a.type)return;
 if(a.type==='navigate' && screens[a.target_screen]){history.push(active);active=a.target_screen;modal=null}
 else if(a.type==='back'){active=history.pop()||active;modal=null}
 else if(['toggle_container','collapse_container','expand_container'].includes(a.type)){
  const node=(screens[active]?.nodes||[]).find(n=>n.id===a.target_node&&collapsibleTypes.has(n.type));
  if(!node)return;
  const current=Object.prototype.hasOwnProperty.call(containerStates,node.id)?containerStates[node.id]:node.props?.expanded!==false;
  containerStates[node.id]=a.type==='collapse_container'?false:a.type==='expand_container'?true:!current;
 }
 else if(a.type==='show_modal')modal=a.target_node;
 else if(a.type==='close_modal')modal=null;
 else if(a.type==='message')message=String(a.text||'');
 else if(a.type==='toggle_visibility'){const t=document.querySelector('[data-node-id="'+CSS.escape(String(a.target_node||''))+'"]');if(t)t.hidden=!t.hidden;return}
 else if(a.type==='add_mock_row'){
  if(!Object.prototype.hasOwnProperty.call(datasets,a.dataset_id)){
   message='Choose an existing dataset for this button.';
  }else{
   const errors=validateBoundInputs(a,screens[active]);
   if(errors.length){message='Validation: '+errors.join('; ');render();return}
   message='';
   const row=resolveActionRow(a,screens[active]);
   if(!Object.keys(row).length){message='Configure fixed values or bind input fields for the new row.'}
   else datasets[a.dataset_id].push(structuredClone(row));
  }
 }
 else if(a.type==='delete_mock_row' && datasets[a.dataset_id])datasets[a.dataset_id].splice(Number(a.row_index||0),1);
 else if(a.type==='set_mock_field' && datasets[a.dataset_id]){let row=datasets[a.dataset_id][Number(a.row_index||0)];if(row&&typeof a.field==='string')row[a.field]=a.value}
 render();}
const gridState=Object.create(null);
const selectedRecords=Object.create(null);
const panelState=Object.create(null);
function tableView(n){
 const p=n.props||{},id=n.id,editable=n.type==='x-editable-grid';
 const dataset=(app.datasets||[]).find(d=>d.id===p.dataset_id);
 const columns=(dataset?.columns||[]).map(col=>col.id);
 const state=gridState[id]||(gridState[id]={search:'',sort:'',dir:1,page:0,selected:new Set()});
 const box=el('div');box.className='sc-table sc-data-grid';box.dataset.gridKind=editable?'editable':'table';
 if(!dataset){box.append(el('p','No dataset assigned.'));return box}
 const data=()=>datasets[p.dataset_id]||[];
 let filter,tbody,count,pages;
 function view(){
  let list=data().map((row,index)=>({row,index}));
  if(p.filter_column&&p.filter_value)list=list.filter(({row})=>String(row[p.filter_column]??'').toLowerCase().includes(String(p.filter_value).toLowerCase()));
  const linkedTerms=(screens[active]?.nodes||[]).filter(source=>source.type==='x-search'&&source.props?.target_table_id===n.id).map(source=>String(inputValues[source.id]||'').toLowerCase()).filter(Boolean);
  if(linkedTerms.length)list=list.filter(({row})=>linkedTerms.every(term=>columns.some(col=>String(row[col]??'').toLowerCase().includes(term))));
  if(state.search.trim())list=list.filter(({row})=>columns.some(col=>String(row[col]??'').toLowerCase().includes(state.search.trim().toLowerCase())));
  if(state.sort)list.sort((a,b)=>{
   const av=String(a.row[state.sort]??''),bv=String(b.row[state.sort]??'');
   const an=Number(av),bn=Number(bv);
   const diff=av.trim()&&bv.trim()&&Number.isFinite(an)&&Number.isFinite(bn)?an-bn:av.localeCompare(bv,undefined,{numeric:true,sensitivity:'base'});
   return diff*state.dir||a.index-b.index;
  });
  const size=Math.max(0,Math.min(100,Number(p.page_size)||0));
  const total=size?Math.max(1,Math.ceil(list.length/size)):1;
  state.page=Math.min(state.page,total-1);
  return {list,size,total,shown:size?list.slice(state.page*size,(state.page+1)*size):list};
 }
 if(p.searchable){let label=el('label','Search records ');filter=el('input');filter.setAttribute('aria-label','Search records');filter.value=state.search;filter.addEventListener('input',()=>{state.search=filter.value;state.page=0;refresh()});label.append(filter);box.append(label)}
 if(editable){
  let actions=el('div');actions.className='sc-data-grid-actions';
  let add=el('button','+ Row');add.addEventListener('click',()=>{
   if(data().length>=1000)return;
   data().push(Object.fromEntries(columns.map(col=>[col,''])));refresh();
  });
  let remove=el('button','Delete selected');remove.addEventListener('click',()=>{
   const removed=new Set(state.selected);
   datasets[p.dataset_id]=data().filter((_,index)=>!removed.has(index));
   for(const item of screens[active]?.nodes||[]){
    if(!['table','x-editable-grid'].includes(item.type)||item.props?.dataset_id!==p.dataset_id)continue;
    const picked=selectedRecords[item.id];
    if(typeof picked==='number')selectedRecords[item.id]=removed.has(picked)?null:picked-[...removed].filter(index=>index<picked).length;
   }
   const picked=selectedRecords[p.dataset_id];
   if(typeof picked==='number')selectedRecords[p.dataset_id]=removed.has(picked)?null:picked-[...removed].filter(index=>index<picked).length;
   state.selected.clear();render();
  });
  actions.append(add,remove);box.append(actions);
  state.remove=remove;
 }
 let wrap=el('div');wrap.className='sc-table-scroll';let table=el('table');let thead=el('thead');let tr=el('tr');
 if(p.selectable||editable)tr.append(el('th','Choose'));
 columns.forEach(col=>{let th=el('th');if(p.sortable){let sort=el('button',col);sort.setAttribute('aria-label','Sort '+col);sort.onclick=()=>{
  if(state.sort===col)state.dir=state.dir===1?-1:1;else{state.sort=col;state.dir=1}
  state.page=0;refresh();
 };th.append(sort)}else th.textContent=col;tr.append(th)});
 thead.append(tr);table.append(thead);tbody=el('tbody');table.append(tbody);wrap.append(table);box.append(wrap);
 pages=el('div');pages.className='sc-data-grid-pages';box.append(pages);count=el('small');box.append(count);
 function refresh(){
  const v=view();tbody.replaceChildren();
  v.shown.forEach(({row,index})=>{
   const tr=el('tr');tr.dataset.rowIndex=index;
   if(state.selected.has(index)||selectedRecords[n.id]===index)tr.className='selected-row';
   const pick=()=>{selectedRecords[n.id]=index;selectedRecords[p.dataset_id]=index;render()};
   tr.tabIndex=0;tr.setAttribute('aria-selected',String(selectedRecords[n.id]===index));
   tr.onclick=event=>{if(event.target.closest('input,button'))return;pick()};
   tr.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();pick()}};
   if(p.selectable||editable){const td=el('td'),check=el('input');check.type='checkbox';check.setAttribute('aria-label','Select row '+(index+1));check.checked=state.selected.has(index);check.onchange=()=>{
    if(check.checked)state.selected.add(index);else state.selected.delete(index);
    selectedRecords[n.id]=index;selectedRecords[p.dataset_id]=index;render();
   };td.append(check);tr.append(td)}
   columns.forEach(col=>{
    const td=el('td');
    if(editable){const input=el('input');input.setAttribute('aria-label','Edit row '+(index+1)+' '+col);
     input.value=String(row[col]??'');input.oninput=()=>{row[col]=input.value};td.append(input)}
    else td.textContent=String(row[col]??'');
    tr.append(td);
   });
   tbody.append(tr);
  });
  if(state.remove)state.remove.disabled=!state.selected.size;
  pages.replaceChildren();
  if(v.size){const previous=el('button','Previous');previous.setAttribute('aria-label','Previous page');previous.disabled=state.page===0;previous.onclick=()=>{state.page--;refresh()};
   const next=el('button','Next');next.setAttribute('aria-label','Next page');next.disabled=state.page>=v.total-1;next.onclick=()=>{state.page++;refresh()};
   pages.append(previous,el('span','Page '+(state.page+1)+' of '+v.total),next)}
  count.textContent=v.list.length+' of '+data().length+' record(s)';
 }
 state.refresh=refresh;
 refresh();return box;
}
function recordDetailView(n){
 const p=n.props||{},box=el('section');box.className='sc-record-detail';
 const title=el('h4',p.label||'Record details');box.append(title);
 const dataset=(app.datasets||[]).find(d=>d.id===p.dataset_id);
 if(!dataset){box.append(el('p','Choose a dataset in Properties.'));return box}
 const rows=datasets[p.dataset_id]||[];
 const picked=p.source_table_id?selectedRecords[p.source_table_id]:selectedRecords[p.dataset_id];
 if(typeof picked!=='number'||picked<0||picked>=rows.length){
  box.append(el('p','Select a row in the linked table or grid.'));return box;
 }
 const record=rows[picked],canEdit=Boolean(p.editable)&&(dataset.persistence||'seed-reset')==='seed-reset';
 for(const col of dataset.columns||[]){
  const label=el('label');label.className='sc-record-field';
  label.append(el('span',col.id));
  if(p.editable){
   const input=el('input');input.setAttribute('aria-label','Detail '+col.id);
   input.value=String(record[col.id]??'');input.disabled=!canEdit;
   input.oninput=()=>{if(canEdit)record[col.id]=input.value};
   input.onchange=()=>{if(canEdit)render()};
   label.append(input);
  }else{
   const output=el('output',String(record[col.id]??''));output.setAttribute('aria-label','Detail '+col.id);label.append(output);
  }
  box.append(label);
 }
 box.append(el('small',canEdit?'Changes update the selected mock record.':p.editable?'Editing requires a seed-reset dataset.':'Read-only detail view.'));
 return box;
}
const dataExpansion=Object.create(null);
function dataExtensionView(n){
 const p=n.props||{},box=el('section');box.className='sc-data-extension';box.dataset.extensionKind=n.type==='x-tree'?'tree':'list';
 box.append(el('strong',p.label||(n.type==='x-tree'?'Tree':'List')));
 const dataset=(app.datasets||[]).find(d=>d.id===p.dataset_id);
 if(!dataset){box.append(el('p','Choose a dataset in Properties.'));return box}
 const rows=datasets[p.dataset_id]||[],cols=dataset.columns||[];
 const labelKey=p.label_column||cols[0]?.id||'';
 const pick=index=>{selectedRecords[p.dataset_id]=index;render()};
 if(n.type==='x-list'){
  const ul=el('ul');ul.className='sc-record-list';
  rows.forEach((record,index)=>{const li=el('li'),button=el('button',String(record[labelKey]??'Unnamed record'));button.setAttribute('aria-pressed',String(selectedRecords[p.dataset_id]===index));button.onclick=()=>pick(index);li.append(button);ul.append(li)});
  box.append(ul);return box;
 }
 const idKey=p.id_column||cols[0]?.id||'',parentKey=p.parent_column||'parent_id';
 const identifiers=new Set(rows.map(row=>String(row[idKey]??'')));
 const children=parent=>rows.map((row,index)=>({row,index})).filter(({row})=>{
  const id=String(row[idKey]??''),parentId=String(row[parentKey]??'');
  return parent===null?(!parentId||parentId===id||!identifiers.has(parentId)):parentId===parent;
 });
 const expanded=dataExpansion[n.id]||(dataExpansion[n.id]=new Set());
 const append=(parent,holder,seen,depth)=>{
  if(depth>=20)return;
  children(parent).filter(item=>!seen.has(item.index)).forEach(({row,index})=>{
   const id=String(row[idKey]??''),descendants=children(id).filter(item=>item.index!==index);
   const li=el('li'),line=el('div');line.className='sc-tree-row';
   if(descendants.length){
    const toggle=el('button',expanded.has(id)?'▾':'▸');toggle.setAttribute('aria-label','Expand '+id);
    toggle.setAttribute('aria-expanded',String(expanded.has(id)));
    toggle.onclick=()=>{if(expanded.has(id))expanded.delete(id);else expanded.add(id);render()};
    line.append(toggle);
   }else line.append(el('span','·'));
   const item=el('button',String((row[labelKey]??id)||'Unnamed node'));
   item.setAttribute('aria-pressed',String(selectedRecords[p.dataset_id]===index));item.onclick=()=>pick(index);line.append(item);
   li.append(line);if(expanded.has(id)&&descendants.length){const nested=el('ul');append(id,nested,new Set([...seen,index]),depth+1);li.append(nested)}
   holder.append(li);
  });
 };
 const ul=el('ul');ul.className='sc-tree-root';append(null,ul,new Set(),0);box.append(ul);return box;
}
function paginationView(n){
 const p=n.props||{},box=el('nav');box.className='sc-pagination';
 box.setAttribute('aria-label',p.label||'Pages');
 const target=(screens[active]?.nodes||[]).find(node=>node.id===p.target_table_id&&['table','x-editable-grid'].includes(node.type));
 if(!target){box.append(el('span','Link this control to a table in Properties.'));return box}
 const source=gridState[target.id]||(gridState[target.id]={page:0,search:'',sort:'',dir:1,selected:new Set()});
 const size=Math.max(1,Number(target.props?.page_size)||1);
 const rows=(datasets[target.props?.dataset_id]||[]).length;
 const total=Math.max(1,Math.ceil(rows/size));
 const current=Math.max(0,Math.min(source.page||0,total-1));
 const previous=el('button','Previous');previous.disabled=current===0;
 previous.onclick=()=>{source.page=Math.max(0,current-1);if(source.refresh)source.refresh();render()};
 const next=el('button','Next');next.disabled=current===total-1;
 next.onclick=()=>{source.page=Math.min(total-1,current+1);if(source.refresh)source.refresh();render()};
 box.append(previous,el('span','Page '+(current+1)+' of '+total),next);return box;
}
const metricPalette=['#2765be','#24a494','#e2a23c','#9562bc','#dc736c','#537b8c','#83af4c'];
function aggregateMetric(rows,op,col){
 if(op==='count')return rows.length;
 const values=rows.map(row=>Number(row[col])).filter(Number.isFinite);
 if(!values.length)return 0;
 if(op==='sum')return values.reduce((a,b)=>a+b,0);
 if(op==='average')return values.reduce((a,b)=>a+b,0)/values.length;
 if(op==='min')return Math.min(...values);
 if(op==='max')return Math.max(...values);
 return 0;
}
function metricText(value){return Number.isFinite(value)?new Intl.NumberFormat('en-GB',{maximumFractionDigits:2}).format(value):'0'}
function metricView(n){
 const p=n.props||{},box=el('div');
 const data=p.dataset_id?datasets[p.dataset_id]||[]:[];
 const title=p.label||(n.type==='x-chart'?'Chart':'KPI');
 box.append(el('strong',title));
 if(n.type==='x-kpi'){
  box.className='sc-kpi';
  const value=p.dataset_id?metricText(aggregateMetric(data,p.aggregation||'count',p.value_column||'')):String(p.value??'0');
  box.append(el('strong',value));box.dataset.metricKind='kpi';
  return box;
 }
 box.className='sc-chart';const chartType=['bar','line','pie'].includes(p.chart_type)?p.chart_type:'bar';
 box.dataset.chartType=chartType;box.setAttribute('role','img');
 box.setAttribute('aria-label',title+' '+chartType+' chart');
 if(!p.dataset_id){box.append(el('p','No dataset selected'));return box}
 const groups=new Map();
 for(const row of data){const key=String(row[p.category_column||'']??'(blank)');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row)}
 const points=Array.from(groups,([name,records])=>({name,value:aggregateMetric(records,p.aggregation||'count',p.value_column||'')})).slice(0,30);
 if(!points.length){box.append(el('p','No chart data'));return box}
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 480 220');
 svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('aria-hidden','true');
 const shape=(tag,attrs)=>{const item=document.createElementNS(ns,tag);for(const [key,val] of Object.entries(attrs))item.setAttribute(key,String(val));svg.append(item);return item};
 const max=Math.max(1,...points.map(point=>Math.abs(point.value)));
 if(chartType==='bar'){
  points.forEach((point,i)=>{const w=440/points.length,h=Math.abs(point.value)/max*155;
   shape('rect',{x:20+i*w+w*.16,y:175-h,width:w*.67,height:h,fill:metricPalette[i%metricPalette.length]})
  });
 }else if(chartType==='line'){
  const places=points.map((point,i)=>[20+i*440/Math.max(1,points.length-1),175-point.value/max*155]);
  shape('polyline',{fill:'none',stroke:metricPalette[0],'stroke-width':3,points:places.map(a=>a.join(',')).join(' ')});
  places.forEach(([cx,cy])=>shape('circle',{cx,cy,r:4,fill:metricPalette[0]}));
 }else{
  const total=points.reduce((sum,point)=>sum+Math.max(0,point.value),0);
  let cumulative=0;
  points.forEach((point,i)=>{
   const fraction=total?Math.max(0,point.value)/total:0,start=cumulative;
   cumulative+=fraction;if(!fraction)return;
   if(fraction>=1){shape('circle',{cx:240,cy:105,r:74,fill:metricPalette[i%metricPalette.length]});return}
   const pos=a=>{const angle=(a-.25)*2*Math.PI;return [240+74*Math.cos(angle),105+74*Math.sin(angle)]};
   const a=pos(start),b=pos(cumulative);
   shape('path',{d:'M 240 105 L '+a.join(' ')+' A 74 74 0 '+(fraction>.5?1:0)+' 1 '+b.join(' ')+' Z',fill:metricPalette[i%metricPalette.length]});
  })
 }
 box.append(svg);
 const legend=el('div');legend.className='sc-chart-legend';
 points.forEach((point,i)=>{const item=el('span',point.name+': '+metricText(point.value)),swatch=el('i');swatch.style.background=metricPalette[i%metricPalette.length];item.prepend(swatch);legend.append(item)});
 box.append(legend);return box;
}
const localMenuExpanded=Object.create(null);
function localNavigationView(n){
 const p=n.props||{},panel=el('nav');panel.className=n.type==='x-menu'?'sc-local-menu':'sc-breadcrumbs';
 panel.setAttribute('aria-label',p.label||(n.type==='x-menu'?'Menu':'Breadcrumbs'));
 if(n.type==='x-breadcrumbs'){
  const path=[...new Set([...history,active])].filter(id=>screens[id]);
  path.forEach((id,i)=>{if(i)panel.append(el('span',' / '));const button=el('button',screens[id].name);
   if(id===active){button.disabled=true;button.setAttribute('aria-current','page')}
   else button.onclick=()=>action({type:'navigate',target_screen:id});
   panel.append(button)});
  return panel;
 }
 panel.append(el('strong',p.label||'Menu'));
 const chosen=p.use_shared!==false&&app.shared_navigation?.items?.length?
  app.shared_navigation.items:(p.items?.length?p.items:screenList.map(s=>({id:'menu-'+s.id,label:s.name,target_screen:s.id})));
 const items=chosen.filter(item=>(!item.target_screen||screens[item.target_screen])&&!(item.hidden_on||[]).includes(active));
 const ids=new Set(items.map(item=>item.id)),expanded=localMenuExpanded[n.id]||(localMenuExpanded[n.id]=new Set());
 const list=el('ul');panel.append(list);
 const append=(item,holder,seen)=>{
  if(seen.has(item.id))return;
  const li=el('li'),row=el('div');row.className='sc-menu-row';
  const button=el('button',(item.icon||'')+' '+(item.label||item.target_screen||'Group'));
  if(item.target_screen===active){button.setAttribute('aria-current','page')}
  if(item.target_screen)button.onclick=()=>action({type:'navigate',target_screen:item.target_screen});
  else button.disabled=true;
  row.append(button);
  const children=items.filter(candidate=>candidate.parent_id===item.id);
  if(children.length){const toggle=el('button',expanded.has(item.id)?'▾':'▸');toggle.setAttribute('aria-label','Expand '+item.label);
   toggle.setAttribute('aria-expanded',String(expanded.has(item.id)));
   toggle.onclick=()=>{if(expanded.has(item.id))expanded.delete(item.id);else expanded.add(item.id);render()};
   row.append(toggle)}
  li.append(row);
  if(children.length&&expanded.has(item.id)){const nested=el('ul');children.forEach(child=>append(child,nested,new Set([...seen,item.id])));li.append(nested)}
  holder.append(li);
 };
 items.filter(item=>!item.parent_id||!ids.has(item.parent_id)).forEach(item=>append(item,list,new Set()));
 return panel;
}
const advancedStates=Object.create(null);
function advancedDiagramView(n){
 const p=n.props||{},box=el('div');box.className='sc-advanced-diagram';box.dataset.advancedKind=n.type;
 const nodes=(n.type==='x-schema-map'?p.tables:p.nodes)||[];
 const sample=[{id:'source',label:'Source',x:25,y:45,fields:['ID','Name']},{id:'target',label:'Target',x:270,y:45,fields:['ID','Source ID']}];
 const data=Array.isArray(nodes)&&nodes.length?nodes:sample,links=Array.isArray(p.links)?p.links:[{source:'source',target:'target'}];
 const state=advancedStates[n.id]||(advancedStates[n.id]={zoom:1,selected:null});
 const heading=el('div');heading.className='sc-diagram-tools';heading.append(el('strong',p.label||(n.type==='x-schema-map'?'Schema map':'Diagram')));
 const minus=el('button','−');minus.setAttribute('aria-label','Zoom out');minus.disabled=state.zoom<=.5;
 minus.onclick=()=>{state.zoom=Math.max(.5,state.zoom-.25);render()};
 const zoom=el('output',Math.round(state.zoom*100)+'%');zoom.setAttribute('aria-label','Zoom level');
 const plus=el('button','+');plus.setAttribute('aria-label','Zoom in');plus.disabled=state.zoom>=2;
 plus.onclick=()=>{state.zoom=Math.min(2,state.zoom+.25);render()};
 heading.append(minus,zoom,plus);box.append(heading);
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 560 290');svg.setAttribute('role','img');
 svg.setAttribute('aria-label',n.type==='x-schema-map'?'Schema relationship map':'Node link diagram');
 const g=document.createElementNS(ns,'g');g.setAttribute('transform','scale('+state.zoom+')');svg.append(g);
 const elSvg=(tag,attrs,parent=g)=>{const elem=document.createElementNS(ns,tag);for(const [key,val] of Object.entries(attrs))elem.setAttribute(key,String(val));parent.append(elem);return elem};
 const lookup=new Map(data.map((item,index)=>[item.id,{...item,index}]));
 const x=item=>Number.isFinite(Number(item.x))?Number(item.x):25+item.index*220;
 const y=item=>Number.isFinite(Number(item.y))?Number(item.y):45;
 links.forEach(link=>{const from=lookup.get(link.source),to=lookup.get(link.target);if(!from||!to)return;
  const sx=x(from)+140,ex=x(to),sy=y(from)+27,ey=y(to)+27,mid=(sx+ex)/2;
  elSvg('path',{d:'M '+sx+' '+sy+' L '+mid+' '+sy+' L '+mid+' '+ey+' L '+ex+' '+ey,fill:'none',stroke:'#52728d','stroke-width':2});
 });
 data.forEach((item,index)=>{const node=lookup.get(item.id);if(!node)return;
  const group=elSvg('g',{'role':'button','tabindex':0,'aria-label':'Select '+item.label});
  group.onclick=()=>{state.selected=item.id;render()};
  group.onkeydown=event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();state.selected=item.id;render()}};
  const fields=n.type==='x-schema-map'&&Array.isArray(item.fields)?item.fields.slice(0,6):[];
  elSvg('rect',{x:x(node),y:y(node),width:140,height:48+fields.length*16,rx:6,
    fill:state.selected===item.id?'#d5e8ff':'#f1f5fa',stroke:'#8296ae','stroke-width':2},group);
  const title=elSvg('text',{x:x(node)+9,y:y(node)+19,'font-size':13,fill:'#162c45'},group);title.textContent=item.label||item.id;
  fields.forEach((field,j)=>{const text=elSvg('text',{x:x(node)+9,y:y(node)+43+j*16,'font-size':11,fill:'#334b65'},group);text.textContent=String(field)});
 });
 const scroll=el('div');scroll.className='sc-diagram-scroller';scroll.append(svg);box.append(scroll);
 if(state.selected)box.append(el('small','Selected: '+(lookup.get(state.selected)?.label||state.selected)));
 return box;
}
function timelineView(n){
 const p=n.props||{},box=el('section');box.className='sc-advanced-timeline';box.dataset.advancedKind='x-timeline';
 box.append(el('strong',p.label||'Timeline'));
 const dataset=(app.datasets||[]).find(d=>d.id===p.dataset_id);
 if(!dataset){box.append(el('p','Choose a dataset in Properties.'));return box}
 const date=p.date_column||'Date',title=p.title_column||dataset.columns?.[0]?.id||'';
 const entries=(datasets[p.dataset_id]||[]).map((row,index)=>({row,index})).sort((a,b)=>String(a.row[date]??'').localeCompare(String(b.row[date]??'')));
 const list=el('ol');entries.forEach(({row,index})=>{const li=el('li'),button=el('button',String(row[date]??'No date')+' — '+String(row[title]??'Event'));
  button.onclick=()=>{selectedRecords[p.dataset_id]=index;render()};li.append(button);list.append(li)});
 box.append(list);return box;
}
function filePreviewView(n){
 const p=n.props||{},box=el('section');box.className='sc-advanced-file-preview';box.dataset.advancedKind='x-file-preview';
 box.append(el('strong',p.label||'File preview'));
 const chooser=el('input');chooser.type='file';chooser.setAttribute('aria-label','Choose preview file');
 chooser.accept=p.accept||'.txt,.md,.json,.csv,.pdf,image/*';box.append(chooser);
 const details=el('div');box.append(details);
 if(p.asset&&assetUris[p.asset]){const img=el('img');img.alt=p.label||'Packaged image';img.src=assetUris[p.asset];details.append(img)}
 else details.append(el('p','Choose a local file to preview. Nothing is uploaded.'));
 chooser.onchange=async()=>{
  details.replaceChildren();const file=chooser.files?.[0];if(!file)return;
  details.append(el('small',file.name));
  if(file.size>5*1024*1024){details.append(el('p','Files over 5 MB are not previewed.'));return}
  if(file.type.startsWith('image/')){const img=el('img');const url=URL.createObjectURL(file);img.alt=file.name;img.src=url;img.onload=()=>URL.revokeObjectURL(url);details.append(img)}
  else if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
   const frame=el('iframe');frame.title='Local PDF preview';frame.setAttribute('sandbox','');
   const url=URL.createObjectURL(file);frame.src=url;frame.addEventListener('load',()=>URL.revokeObjectURL(url),{once:true});details.append(frame)
  }else if(file.type.startsWith('text/')||/\\.(txt|md|json|csv|log)$/i.test(file.name)){
   details.append(el('pre',await file.slice(0,128*1024).text()))
  }else details.append(el('p','Preview unavailable for this file type.'));
 };
 box.append(el('small','Local prototype only — file contents are not saved to .scraft or uploaded.'));
 return box;
}
function renderNode(n,parent){const p=n.props||{},l=n.layout||{};let x;
 switch(n.type){
 case 'text':x=el('div',p.text||'Text');break;
 case 'button':x=el('button',p.label||'Button');x.addEventListener('click',()=>action(n.action));break;
 case 'input':x=el('input');x.required=!!p.required;if(p.min_length!==undefined)x.minLength=Number(p.min_length);if(p.max_length!==undefined)x.maxLength=Number(p.max_length);x.placeholder=p.placeholder||'';x.value=p.value||'';captureInput(n,x,'input');break;
 case 'select':x=el('select');(p.options||[]).forEach(v=>{let o=el('option',typeof v==='string'?v:v.label);o.value=selectValue(v);x.append(o)});captureInput(n,x,'select');break;
 case 'checkbox':x=el('label');let c=el('input');c.type='checkbox';c.checked=!!p.checked;c.required=!!p.required;captureInput(n,c,'checkbox');x.append(c,el('span',p.label||''));break;
 case 'image':{x=el('img');x.alt=p.alt||'';if(assetUris[p.asset])x.src=assetUris[p.asset];break}
 case 'table':case 'x-editable-grid':x=tableView(n);break;
 case 'x-record-detail':x=recordDetailView(n);break;
 case 'x-list':case 'x-tree':x=dataExtensionView(n);break;
 case 'x-pagination':x=paginationView(n);break;
 case 'x-menu':case 'x-breadcrumbs':x=localNavigationView(n);break;
 case 'x-schema-map':case 'x-diagram':x=advancedDiagramView(n);break;
 case 'x-timeline':x=timelineView(n);break;
 case 'x-file-preview':x=filePreviewView(n);break;
 case 'modal':x=el('div');if(modal!==n.id)return; x.className='sc-modal';x.append(el('h3',p.label||'Dialog'));break;
 case 'tabs':case 'x-wizard':{
  x=el('section');x.className='sc-panel-container';x.dataset.panelKind=n.type;
  const labels=Array.isArray(p.tab_labels)&&p.tab_labels.length?p.tab_labels:['Step 1','Step 2'];
  const selected=Math.max(0,Math.min(labels.length-1,panelState[n.id]||0));
  const nav=el('nav');nav.setAttribute('aria-label',n.type==='tabs'?'Tabs':'Wizard steps');nav.className='sc-panel-nav';
  labels.forEach((label,i)=>{const btn=el('button',label);btn.setAttribute('aria-pressed',String(selected===i));btn.onclick=()=>{panelState[n.id]=i;render()};nav.append(btn)});
  x.append(nav);const content=el('div');content.className='sc-panel-content';x.append(content);x._childContainer=content;
  if(n.type==='x-wizard'){const buttons=el('div');buttons.className='sc-wizard-buttons';
   const previous=el('button','Previous step');previous.disabled=selected===0;previous.onclick=()=>{panelState[n.id]=Math.max(0,selected-1);render()};
   const next=el('button','Next step');next.disabled=selected===labels.length-1;next.onclick=()=>{panelState[n.id]=Math.min(labels.length-1,selected+1);render()};
   buttons.append(previous,next);x.append(buttons)}
  break
 }
 case 'x-accordion':{
  x=el('section');x.className='sc-accordion';
  const expanded=Object.prototype.hasOwnProperty.call(panelState,n.id)?panelState[n.id]:p.expanded!==false;
  const button=el('button',(p.label||'Details')+(expanded?' ▾':' ▸'));
  button.setAttribute('aria-expanded',String(expanded));button.onclick=()=>{panelState[n.id]=!expanded;render()};
  x.append(button);const content=el('div');content.className='sc-accordion-content';content.hidden=!expanded;x.append(content);
  x._childContainer=expanded?content:null;x._hideChildren=!expanded;break
 }
 case 'container':case 'x-card':case 'x-grid':case 'x-flex':case 'x-toolbar':case 'x-sidebar':case 'x-splitter':{
  x=el('section');x.className='sc-box'+(n.type==='x-card'?' sc-card':'');
  const header=el('div');header.className='sc-collapse-header';header.append(el('strong',p.label||n.type));
  const expanded=Object.prototype.hasOwnProperty.call(containerStates,n.id)?containerStates[n.id]:p.expanded!==false;
  if(p.collapsible){const button=el('button',expanded?'▾':'▸');button.setAttribute('aria-label','Toggle '+(p.label||n.type));
   button.setAttribute('aria-expanded',String(expanded));button.onclick=()=>action({type:'toggle_container',target_node:n.id});header.append(button)}
  x.append(header);
  if(!expanded){x._hideChildren=true;x.classList.add('is-collapsed');x.style.height='40px';break}
  const content=el('div');content.className='sc-layout-content';
  if(n.type==='x-sidebar'){content.style.display='flex';content.style.gap='8px'}
  if(n.type==='x-splitter'){content.style.display='grid';content.style.gridTemplateColumns=Math.max(10,Math.min(90,Number(p.split_percent)||50))+'% 1fr';content.style.gap='8px'}
  x.append(content);x._childContainer=content;break
 }
 case 'x-date':x=el('input');x.type='date';x.required=!!p.required;if(p.min)x.min=p.min;if(p.max)x.max=p.max;x.value=p.value||'';captureInput(n,x,'date');break;
 case 'x-number':x=el('input');x.type='number';x.required=!!p.required;if(p.min!==undefined)x.min=String(p.min);if(p.max!==undefined)x.max=String(p.max);x.placeholder=p.placeholder||'0';x.value=p.value??'';captureInput(n,x,'number');break;
 case 'x-textarea':x=el('textarea');x.required=!!p.required;if(p.min_length!==undefined)x.minLength=Number(p.min_length);if(p.max_length!==undefined)x.maxLength=Number(p.max_length);x.placeholder=p.placeholder||'';x.value=p.value||'';captureInput(n,x,'textarea');break;
 case 'x-time':x=el('input');x.type='time';x.setAttribute('aria-label',p.label||'Time');x.required=!!p.required;if(p.min)x.min=p.min;if(p.max)x.max=p.max;x.value=p.value||'';captureInput(n,x,'time');break;
 case 'x-radio':{x=el('fieldset');x.className='sc-radio';x.append(el('legend',p.label||'Choose'));
  const options=p.options||[];const selected=Object.prototype.hasOwnProperty.call(inputValues,n.id)?inputValues[n.id]:p.value??'';
  options.forEach((opt,i)=>{const value=selectValue(opt),label=el('label'),radio=el('input');radio.type='radio';radio.name='radio-'+n.id;radio.value=value;radio.checked=selected===value;radio.disabled=false;
   radio.onchange=()=>{inputValues[n.id]=value};label.append(radio,el('span',typeof opt==='string'?opt:opt.label||String(value)));x.append(label)});
  break}
 case 'x-toggle':{x=el('label');x.className='sc-toggle';const control=el('input');control.type='checkbox';control.setAttribute('role','switch');control.setAttribute('aria-label',p.label||'Toggle');control.checked=!!p.checked;captureInput(n,control,'checkbox');x.append(control,el('span',p.label||'Toggle'));break}
 case 'x-file-upload':{x=el('label');x.className='sc-file-input';x.append(el('span',p.label||'Choose file'));
  const control=el('input');control.type='file';control.setAttribute('aria-label',p.label||'Choose file');if(p.accept)control.accept=p.accept;
  const filename=el('small',String(inputValues[n.id]||'No file selected'));
  control.onchange=()=>{inputValues[n.id]=control.files?.[0]?.name||'';filename.textContent=String(inputValues[n.id]||'No file selected')};
  x.append(control,filename,el('small','Prototype: filename only; file contents are never stored or uploaded.'));break}
 case 'x-search':x=el('input');x.type='search';x.setAttribute('aria-label',p.label||'Search');x.placeholder=p.placeholder||'Search records';x.value=p.value||'';
  captureInput(n,x,'search');x.addEventListener('input',()=>{if(p.target_table_id&&gridState[p.target_table_id]?.refresh)gridState[p.target_table_id].refresh()});break;
 case 'x-kpi':case 'x-chart':x=metricView(n);break;
 default:x=el('section','Unsupported object: '+n.type+' (preserved in .scraft)');x.className='sc-unsupported';break;
 }
 x.dataset.nodeId=n.id;x.classList.add('sc-node');applyNodeStyle(n,x);
 if(typeof l.width==='number')x.style.width=l.width+'px';else if(l.width==='fill')x.style.width='100%';
 if(x._hideChildren)x.style.height='40px';else if(typeof l.height==='number')x.style.height=l.height+'px';
 if(typeof l.max_height==='number')x.style.maxHeight=l.max_height+'px';
 if(l.overflow_x)x.style.overflowX=l.overflow_x;if(l.overflow_y)x.style.overflowY=l.overflow_y;
 if(l.x!==undefined||l.y!==undefined){x.style.position='absolute';x.style.left=(l.x||0)+'px';x.style.top=(l.y||0)+'px'}
 parent.append(x);return x;
}
function renderSharedNav(){
 const nav=app.shared_navigation;
 const panel=el('nav');panel.className='sc-shared-nav nav-'+nav.position+(navCollapsed?' is-collapsed':'')+(mobileOpen?' mobile-open':'');
 panel.setAttribute('aria-label','Application navigation');panel.dataset.navPosition=nav.position;
 const controls=el('div');controls.className='sc-shared-nav-controls';
 if(nav.collapsible){const toggle=el('button',navCollapsed?'☰':'◀');toggle.setAttribute('aria-label','Toggle shared navigation');
  toggle.setAttribute('aria-expanded',String(!navCollapsed));toggle.onclick=()=>{navCollapsed=!navCollapsed;render()};controls.append(toggle)}
 const mobile=el('button','☰ Menu');mobile.className='sc-mobile-nav-toggle';mobile.setAttribute('aria-label','Toggle mobile navigation');
 mobile.setAttribute('aria-expanded',String(mobileOpen));mobile.onclick=()=>{mobileOpen=!mobileOpen;render()};controls.append(mobile);panel.append(controls);
 const listing=el('div');listing.className='sc-shared-nav-items';panel.append(listing);
 const valid=new Set(Object.keys(screens));
 const items=(nav.items||[]).filter(item=>(!item.target_screen||valid.has(item.target_screen))&&!(item.hidden_on||[]).includes(active));
 const ids=new Set(items.map(item=>item.id));
 function make(item,trail=new Set()){
  if(trail.has(item.id))return null;
  const entry=el('div');entry.className='sc-shared-nav-entry';const row=el('div');row.className='sc-shared-nav-row';
  const title=navCollapsed?(item.icon||'•'):(item.icon?item.icon+' ':'')+item.label;
  const button=el('button',title);button.title=item.label;
  if(item.target_screen===active){button.classList.add('is-active');button.setAttribute('aria-current','page')}
  button.onclick=()=>{if(item.target_screen&&item.target_screen!==active){mobileOpen=false;action({type:'navigate',target_screen:item.target_screen})}};
  row.append(button);
  const children=items.filter(candidate=>candidate.parent_id===item.id);
  if(children.length&&!navCollapsed){const expanded=navExpanded.has(item.id);
   const expand=el('button',expanded?'▾':'▸');expand.setAttribute('aria-label','Expand '+item.label);expand.setAttribute('aria-expanded',String(expanded));
   expand.onclick=()=>{if(expanded)navExpanded.delete(item.id);else navExpanded.add(item.id);render()};row.append(expand)}
  entry.append(row);
  if(children.length&&navExpanded.has(item.id)&&!navCollapsed){const subtree=el('div');subtree.className='sc-shared-nav-children';
   for(const child of children){const nested=make(child,new Set([...trail,item.id]));if(nested)subtree.append(nested)}
   entry.append(subtree)}
  return entry;
 }
 items.filter(item=>!item.parent_id||!ids.has(item.parent_id)).forEach(item=>{const entry=make(item);if(entry)listing.append(entry)});
 return panel;
}
function render(){root.replaceChildren();menu.replaceChildren();applyTheme();
 const shared=app.shared_navigation?.enabled;
 if(!shared)screenList.forEach(s=>{let b=el('button',s.name);b.disabled=s.id===active;b.onclick=()=>action({type:'navigate',target_screen:s.id});menu.append(b)});
 else {
  const back=el('button','← Back');back.setAttribute('aria-label','Prototype back');back.disabled=!history.length;
  back.onclick=()=>action({type:'back'});menu.append(back);
  const home=el('button','⌂ Home');home.setAttribute('aria-label','Prototype home');home.disabled=active===app.start_screen;
  home.onclick=()=>action({type:'navigate',target_screen:app.start_screen});menu.append(home);
 }
 let s=screens[active];if(!s)return;
 const layout=el('div');layout.className='sc-shared-layout nav-layout-'+(app.shared_navigation?.position||'left');root.append(layout);
 if(shared&&!s.shared_navigation_hidden)layout.append(renderSharedNav());
 const screenContent=el('div');screenContent.className='sc-screen-content';layout.append(screenContent);
 let heading=el('h2',s.name);screenContent.append(heading);
 let wrapper=el('section');wrapper.style.overflowX=s.layout?.overflow_x||'auto';wrapper.style.overflowY=s.layout?.overflow_y||'auto';wrapper.style.minHeight='60vh';wrapper.style.background='var(--sc-page)';wrapper.style.color='var(--sc-text)';screenContent.append(wrapper);
 let nodes=new Map((s.nodes||[]).map(n=>[n.id,n]));let rendered=new Set();
 function build(n,parent,trail=new Set()){if(rendered.has(n.id)||trail.has(n.id))return;rendered.add(n.id);let box=renderNode(n,parent);if(!box)return;
 if(box._hideChildren)return;
 for(const child of s.nodes||[]){
  if(child.parent_id!==n.id)continue;
  if((n.type==='tabs'||n.type==='x-wizard')&&(Number(child.props?.tab_index)||0)!==(panelState[n.id]||0))continue;
  build(child,box._childContainer||box,new Set([...trail,n.id]));
 }
}
 (s.nodes||[]).filter(n=>!n.parent_id||!nodes.has(n.parent_id)).forEach(n=>build(n,wrapper));
 if(message)root.append(el('div',message));}
render();
</script></body></html>"""
