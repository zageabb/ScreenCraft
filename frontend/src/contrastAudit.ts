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
 * Conservative contrast audit for text on explicitly coloured ancestors.
 * Report only values whose backgrounds can be determined; never silently
 * change author-supplied colours or infer transparency/gradients.
 */
export function inspectTextContrast(doc:Document,theme:string):ContrastFinding[]{
 const tokens=doc.themes[theme]?.tokens||{};
 const dark=theme.toLowerCase().includes('dark');
 const page=tokens['surface.page']||tokens['surface.default']||(dark?'#101827':'#FFFFFF');
 const defaultText=tokens['text.primary']||(dark?'#F1F5F9':'#172033');
 const findings:ContrastFinding[]=[];
 for(const screen of doc.screens){
  const byId=new Map(screen.nodes.map(node=>[node.id,node]));
  for(const node of screen.nodes){
   if(node.type!=='text')continue;
   const foreground=color(node,'color',tokens)||defaultText;
   let background:string=page;
   let cursor:Node|undefined=node,seen=new Set<string>();
   while(cursor&&!seen.has(cursor.id)){
    seen.add(cursor.id);
    const direct=color(cursor,'background_color',tokens);
    if(direct){background=direct;break}
    cursor=cursor.parent_id?byId.get(cursor.parent_id):undefined;
   }
   const ratio=contrastRatio(foreground,background);
   if(ratio!==null&&ratio<4.5){
    findings.push({screen:screen.name,nodeId:node.id,theme,ratio,foreground,background,
     message:'Text contrast below 4.5:1 (WCAG AA). Consider a semantic foreground or surface token.'});
   }
  }
 }
 return findings;
}
