export type Action={type:string;target_screen?:string;target_node?:string;dataset_id?:string;text?:string;values?:Record<string,unknown>;field_bindings?:Record<string,string>}
export type Node={id:string;type:string;parent_id:string|null;props:Record<string,any>;layout:Record<string,any>;style?:Record<string,string>;action?:Action;bindings?:Record<string,any>;responsive?:any[];accessibility?:Record<string,any>}
export type Screen={id:string;name:string;viewport:{width:number;height:number};layout:Record<string,any>;nodes:Node[]}
export type Dataset={id:string;columns:{id:string;type:string}[];rows:Record<string,any>[];persistence?:string}
export type Document={application_id:string;name:string;start_screen:string;default_theme:string;screen_order:string[];screens:Screen[];components:any[];themes:Record<string,{tokens:Record<string,string>}>;datasets:Dataset[];assets:any[]}
import catalogue from './catalogue.snapshot.json';
export const palette=catalogue.objects.map(o=>o.id);
export const catalogueEntries=catalogue.objects;
export const catalogueInfo={source:catalogue.canonical_source,sha:catalogue.source_blob_sha,version:catalogue.catalogue_version};
export function isContainer(type:string){return type!=='table'&&isSupported(type)&&!!catalogueEntries.find(o=>o.id===type)?.container?.supports_children}
export function isSupported(type:string){return new Set(['text','button','input','select','checkbox','table','image','container','tabs','modal','x-card','x-grid','x-flex','x-toolbar','x-date','x-number','x-textarea','x-kpi']).has(type)}
export function descendants(screen:Screen,nodeId:string){const result=new Set<string>();let frontier=[nodeId];while(frontier.length){const id=frontier.pop()!;for(const n of screen.nodes){if(n.parent_id===id&&!result.has(n.id)){result.add(n.id);frontier.push(n.id)}}}return result}
export function removeNodeTree(doc:Document,screenId:string,nodeId:string){const screen=doc.screens.find(s=>s.id===screenId);if(!screen)return doc;const removed=descendants(screen,nodeId);removed.add(nodeId);return {...doc,screens:doc.screens.map(s=>s.id!==screenId?s:{...s,nodes:s.nodes.filter(n=>!removed.has(n.id)).map(n=>n.action?.target_node&&removed.has(n.action.target_node)?{...n,action:undefined}:n)})}}
export function reparentNode(doc:Document,screenId:string,nodeId:string,parentId:string|null){const s=doc.screens.find(s=>s.id===screenId);if(!s)return doc;const node=s.nodes.find(n=>n.id===nodeId);if(!node||parentId===nodeId)return doc;if(parentId){const parent=s.nodes.find(n=>n.id===parentId);if(!parent||!isContainer(parent.type)||descendants(s,nodeId).has(parentId))return doc}return updateNode(doc,screenId,nodeId,n=>({...n,parent_id:parentId,layout:{...n.layout,x:24,y:24}}))}
export function reorderScreen(doc:Document,screenId:string,direction:-1|1){const order=[...doc.screen_order];const i=order.indexOf(screenId);const j=i+direction;if(i<0||j<0||j>=order.length)return doc;[order[i],order[j]]=[order[j],order[i]];return {...doc,screen_order:order}}
/** Remove a screen without orphaning navigation actions or the document entry screen. */
export function removeScreen(doc:Document,screenId:string):Document {
 if(doc.screens.length<=1||!doc.screens.some(s=>s.id===screenId))return doc;
 const screens=doc.screens.filter(s=>s.id!==screenId).map(s=>({...s,nodes:s.nodes.map(n=>
   n.action?.type==='navigate'&&n.action.target_screen===screenId
     ?{...n,action:undefined}:n
 )}));
 const order=doc.screen_order.filter(id=>id!==screenId);
 return {...doc,screens,screen_order:order,
   start_screen:doc.start_screen===screenId?(order[0]||screens[0].id):doc.start_screen};
}
export function cloneSubtree(screen:Screen,nodeId:string){const ids=descendants(screen,nodeId);ids.add(nodeId);const idMap=new Map([...ids].map(id=>[id,crypto.randomUUID()]));return screen.nodes.filter(n=>ids.has(n.id)).map(n=>({...cloneDoc(n),id:idMap.get(n.id)!,parent_id:n.id===nodeId?null:(n.parent_id?idMap.get(n.parent_id)||null:null),action:n.action?.target_node&&idMap.has(n.action.target_node)?{...n.action,target_node:idMap.get(n.action.target_node)}:n.action}))}

export function newNode(type:string,x=24,y=24):Node{
 const props:Record<string,any>=type==='button'?{label:'Button'}:type==='text'?{text:'Text'}:type==='select'?{options:['Option 1','Option 2']}:type==='table'?{dataset_id:''}:type==='x-kpi'?{label:'Total',value:'100'}:type==='x-toolbar'?{label:'Toolbar'}:type==='x-card'?{label:'Card'}:type==='x-grid'?{label:'Grid'}:type==='x-date'?{label:'Date'}:type==='x-number'?{placeholder:'0'}:type==='x-textarea'?{placeholder:'Enter text'}:{};
 const container=isContainer(type);
 return {id:crypto.randomUUID(),type,parent_id:null,props,layout:{x,y,width:type==='table'?480:container?420:200,height:type==='table'?200:container?220:44,overflow_x:'auto',overflow_y:'auto',...(type==='x-grid'?{mode:'grid'}:type==='x-flex'||type==='x-toolbar'?{mode:'flex'}:{})}};
}
export function updateNode(doc:Document,screenId:string,nodeId:string,update:(n:Node)=>Node):Document{return {...doc,screens:doc.screens.map(s=>s.id!==screenId?s:{...s,nodes:s.nodes.map(n=>n.id!==nodeId?n:update(n))})}}
export function insertNode(doc:Document,screenId:string,node:Node):Document{return {...doc,screens:doc.screens.map(s=>s.id!==screenId?s:{...s,nodes:[...s.nodes,node]})}}
export function cloneDoc<T>(doc:T):T{return JSON.parse(JSON.stringify(doc))}
export const blank:Document={application_id:'local',name:'Untitled Application',start_screen:'home',default_theme:'light',screen_order:['home'],screens:[{id:'home',name:'Home',viewport:{width:1280,height:800},layout:{mode:'freeform',overflow_x:'auto',overflow_y:'auto'},nodes:[]}],components:[],themes:{light:{tokens:{'surface.default':'#ffffff','text.primary':'#172033','action.primary':'#2563eb'}},dark:{tokens:{'surface.default':'#1e2737','text.primary':'#f7f7f7','action.primary':'#75aaff'}}},datasets:[],assets:[]};
