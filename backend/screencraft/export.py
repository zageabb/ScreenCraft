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
:root{font-family:system-ui,sans-serif;color:#172033;background:#f5f7fa}body{margin:0}header{padding:12px 20px;background:#24344f;color:white;display:flex;gap:12px;align-items:center}main{padding:16px;max-width:100%;overflow:auto;min-height:70vh}button,input,select{font:inherit;padding:8px;margin:4px;max-width:100%}button{cursor:pointer;border:1px solid #aac0d9;border-radius:6px}table{border-collapse:collapse;min-width:100%;background:white}td,th{padding:9px;border:1px solid #dce1e8;white-space:nowrap}section{position:relative;overflow:auto}.sc-node{box-sizing:border-box} .sc-table{max-width:100%;overflow:auto}.sc-modal{background:white;border:2px solid #789;border-radius:8px;padding:16px;position:fixed;top:25%;left:25%;width:50%;z-index:10;box-shadow:0 0 0 100vmax #0006} .sc-notice{padding:8px;background:#def;border-radius:4px} .sc-menu{display:flex;gap:4px;flex-wrap:wrap}.sc-box{border:1px dashed #859ab0;background:#f6f8fc;padding:6px;min-height:70px}.sc-card{background:white;border:1px solid #cbd5e1;border-radius:7px;box-shadow:0 2px 7px #0001}.sc-kpi{display:flex;flex-direction:column;border:1px solid #ddd;border-radius:7px;padding:8px;background:#edf2fa}.sc-kpi strong{font-size:24px}.sc-unsupported{border:1px dashed #b77d45;color:#875023;background:#fff6eb;padding:7px}
</style></head><body><header><strong id="title"></strong><nav class="sc-menu" id="menu"></nav><small>Interactive prototype — no production actions</small></header><main id="root"></main><script type="application/json" id="sc-document">"""+payload+"""</script><script type="application/json" id="sc-assets">"""+asset_payload+"""</script><script>
'use strict';
const app=JSON.parse(document.getElementById('sc-document').textContent);
const assetUris=JSON.parse(document.getElementById('sc-assets').textContent);
const screens=Object.fromEntries(app.screens.map(s=>[s.id,s]));
const screenList=(app.screen_order||app.screens.map(s=>s.id)).map(id=>screens[id]).filter(Boolean);
let active=app.start_screen,history=[],modal=null,message='',theme=app.default_theme||'light';
let datasets=Object.fromEntries((app.datasets||[]).map(d=>[d.id,structuredClone(d.rows||[])]));
const inputValues=Object.create(null);
const SUPPORTED_INPUTS=new Set(['input','select','checkbox','x-date','x-number','x-textarea']);
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
   :source.type==='checkbox'?false:
    source.type==='select'?selectValue(options[0]??''):
    (source.props?.value??'');
 }
 return row;
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
 else if(a.type==='show_modal')modal=a.target_node;
 else if(a.type==='close_modal')modal=null;
 else if(a.type==='message')message=String(a.text||'');
 else if(a.type==='toggle_visibility'){const t=document.querySelector('[data-node-id="'+CSS.escape(String(a.target_node||''))+'"]');if(t)t.hidden=!t.hidden;return}
 else if(a.type==='add_mock_row'){
  if(!Object.prototype.hasOwnProperty.call(datasets,a.dataset_id)){
   message='Choose an existing dataset for this button.';
  }else{
   const row=resolveActionRow(a,screens[active]);
   if(!Object.keys(row).length){message='Configure fixed values or bind input fields for the new row.'}
   else datasets[a.dataset_id].push(structuredClone(row));
  }
 }
 else if(a.type==='delete_mock_row' && datasets[a.dataset_id])datasets[a.dataset_id].splice(Number(a.row_index||0),1);
 else if(a.type==='set_mock_field' && datasets[a.dataset_id]){let row=datasets[a.dataset_id][Number(a.row_index||0)];if(row&&typeof a.field==='string')row[a.field]=a.value}
 render();}
function renderNode(n,parent){const p=n.props||{},l=n.layout||{};let x;
 switch(n.type){
 case 'text':x=el('div',p.text||'Text');break;
 case 'button':x=el('button',p.label||'Button');x.addEventListener('click',()=>action(n.action));break;
 case 'input':x=el('input');x.placeholder=p.placeholder||'';x.value=p.value||'';captureInput(n,x,'input');break;
 case 'select':x=el('select');(p.options||[]).forEach(v=>{let o=el('option',typeof v==='string'?v:v.label);o.value=selectValue(v);x.append(o)});captureInput(n,x,'select');break;
 case 'checkbox':x=el('label');let c=el('input');c.type='checkbox';c.checked=!!p.checked;captureInput(n,c,'checkbox');x.append(c,el('span',p.label||''));break;
 case 'image':{x=el('img');x.alt=p.alt||'';if(assetUris[p.asset])x.src=assetUris[p.asset];break}
 case 'table':{x=el('div');x.className='sc-table';let t=el('table'),data=datasets[p.dataset_id]||[],definition=(app.datasets||[]).find(d=>d.id===p.dataset_id);let cols=(definition?.columns||[]).map(c=>c.id);if(!cols.length)cols=Object.keys(data[0]||{});let tr=el('tr');cols.forEach(k=>tr.append(el('th',k)));t.append(tr);data.forEach(row=>{let tr=el('tr');cols.forEach(k=>tr.append(el('td',row[k]??'')));t.append(tr)});x.append(t);break}
 case 'modal':x=el('div');if(modal!==n.id)return; x.className='sc-modal';x.append(el('h3',p.label||'Dialog'));break;
 case 'container':case 'x-card':case 'x-grid':case 'x-flex':case 'x-toolbar':x=el('section');x.className='sc-box'+(n.type==='x-card'?' sc-card':'');x.append(el('strong',p.label||n.type));break;
 case 'x-date':x=el('input');x.type='date';x.value=p.value||'';captureInput(n,x,'date');break;
 case 'x-number':x=el('input');x.type='number';x.placeholder=p.placeholder||'0';x.value=p.value??'';captureInput(n,x,'number');break;
 case 'x-textarea':x=el('textarea');x.placeholder=p.placeholder||'';x.value=p.value||'';captureInput(n,x,'textarea');break;
 case 'x-kpi':x=el('div');x.className='sc-kpi';x.append(el('small',p.label||'KPI'),el('strong',p.value||'0'));break;
 case 'tabs':x=el('div',p.label||'Tabs');break;
 default:x=el('section','Unsupported object: '+n.type+' (preserved in .scraft)');x.className='sc-unsupported';break;
 }
 x.dataset.nodeId=n.id;x.classList.add('sc-node');
 if(typeof l.width==='number')x.style.width=l.width+'px';else if(l.width==='fill')x.style.width='100%';
 if(typeof l.height==='number')x.style.height=l.height+'px';
 if(typeof l.max_height==='number')x.style.maxHeight=l.max_height+'px';
 if(l.overflow_x)x.style.overflowX=l.overflow_x;if(l.overflow_y)x.style.overflowY=l.overflow_y;
 if(l.x!==undefined||l.y!==undefined){x.style.position='absolute';x.style.left=(l.x||0)+'px';x.style.top=(l.y||0)+'px'}
 parent.append(x);return x;
}
function render(){root.replaceChildren();menu.replaceChildren();
 screenList.forEach(s=>{let b=el('button',s.name);b.disabled=s.id===active;b.onclick=()=>action({type:'navigate',target_screen:s.id});menu.append(b)});
 let s=screens[active];if(!s)return;
 let heading=el('h2',s.name);root.append(heading);
 let wrapper=el('section');wrapper.style.overflowX=s.layout?.overflow_x||'auto';wrapper.style.overflowY=s.layout?.overflow_y||'auto';wrapper.style.minHeight='60vh';root.append(wrapper);
 let nodes=new Map((s.nodes||[]).map(n=>[n.id,n]));let rendered=new Set();
 function build(n,parent,trail=new Set()){if(rendered.has(n.id)||trail.has(n.id))return;rendered.add(n.id);let box=renderNode(n,parent);if(!box)return;for(const child of s.nodes||[])if(child.parent_id===n.id)build(child,box,new Set([...trail,n.id]))}
 (s.nodes||[]).filter(n=>!n.parent_id||!nodes.has(n.parent_id)).forEach(n=>build(n,wrapper));
 if(message)root.append(el('div',message));}
render();
</script></body></html>"""
