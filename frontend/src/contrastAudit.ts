import type {Document,Node} from './model';

export type ContrastFinding={screen:string;nodeId:string;theme:string;ratio:number;foreground:string;background:string;message:string};
function rgb(value:string):number[]|null{
 const hex=value.trim();
 if(!/^#[0-9a-fA-F]{6}$/.test(hex))return null;
 return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
}
export function contrastRatio(foreground:string,background:string):number|null{
 const a=rgb(foreground),b=rgb(background);
 if(!a||!b)return null;
 const lum=(channels:number[])=>channels.reduce((total,c,i)=>{
  const n=c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
  return total+n*[0.2126,0.7152,0.0722][i];
 },0);
 const x=lum(a),y=lum(b);
 return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
function color(node:Node,key:string,tokens:Record<string,string>):string|undefined{
 const style=node.style||{};
 const token=style[key+'_token'];
 if(typeof token==='string'&&typeof tokens[token]==='string')return tokens[token];
 const literal=style[key];
 return typeof literal==='string'?literal:undefined;
}
/**
 * Non-mutating semantic contrast analysis of explicit and theme-supplied colours.
 * This is not a computed-style accessibility certification: gradients, alpha,
 * images, overlays and browser-inherited custom CSS require manual review.
 */
export function inspectTextContrast(doc:Document,theme:string):ContrastFinding[]{
 const tokens=doc.themes?.[theme]?.tokens||{};
 const dark=theme.toLowerCase().includes('dark');
 const page=tokens['surface.page']||tokens['surface.default']||(dark?'#101827':'#FFFFFF');
 const defaultText=tokens['text.primary']||(dark?'#F1F5F9':'#172033');
 const findings:ContrastFinding[]=[];
 function add(screen:string,nodeId:string,foreground:string,background:string,message:string){
  const ratio=contrastRatio(foreground,background);
  if(ratio!==null&&ratio<4.5)findings.push({screen,nodeId,theme,ratio,foreground,background,message});
 }
 // Shared navigation is not a screen node; checking only node.type==='text'
 // misses the unreadable navigation labels reported during Phase 10 acceptance.
 if(doc.shared_navigation?.enabled){
  const navBackground=tokens['surface.nav']||(dark?'#0B1220':'#E9F1FC');
  for(const item of doc.shared_navigation.items||[]){
   add('Shared navigation',item.id,defaultText,navBackground,
    'Shared navigation label contrast below 4.5:1. Adjust text.primary or surface.nav.');
   if(item.target_screen){
    const selected=tokens['surface.selected']||(dark?'#263F66':'#DBEAFE');
    add('Shared navigation',item.id+':active',defaultText,selected,
     'Selected navigation label contrast below 4.5:1. Adjust text.primary or surface.selected.');
   }
  }
 }
 for(const screen of doc.screens||[]){
  const byId=new Map(screen.nodes.map(node=>[node.id,node]));
  for(const node of screen.nodes){
   if(node.type!=='text'&&node.type!=='button')continue;
   let background:string=page;
   let cursor:Node|undefined=node,seen=new Set<string>();
   while(cursor&&!seen.has(cursor.id)){
    seen.add(cursor.id);
    const direct=color(cursor,'background_color',tokens);
    if(direct){background=direct;break}
    cursor=cursor.parent_id?byId.get(cursor.parent_id):undefined;
   }
   if(node.type==='button'){
    // A button's native background is the semantic action colour, unless
    // the object itself has an explicitly authored background override.
    const buttonBackground=color(node,'background_color',tokens)||tokens['action.primary']||'#2563EB';
    const buttonForeground=color(node,'color',tokens)||tokens['action.on_primary']||'#FFFFFF';
    add(screen.name,node.id,buttonForeground,buttonBackground,
     'Button label contrast below 4.5:1. Adjust action.on_primary/action.primary or object colours.');
   }else{
    const foreground=color(node,'color',tokens)||defaultText;
    add(screen.name,node.id,foreground,background,
     'Text contrast below 4.5:1 (WCAG AA). Consider a semantic foreground or surface token.');
   }
  }
 }
 return findings;
}
