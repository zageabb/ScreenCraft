import {test,expect} from '@playwright/test';

test('phase 10 contrast audit includes shared navigation, active item and authored button colours',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {inspectTextContrast}=await import('/src/contrastAudit.ts');
  const doc={
   themes:{light:{tokens:{
    'surface.page':'#FFFFFF','surface.nav':'#172A3D',
    'surface.selected':'#18283A','text.primary':'#202D3E',
    'action.primary':'#F0F0F0','action.on_primary':'#EFEFEF'
   }}},
   shared_navigation:{enabled:true,position:'left',collapsible:true,items:[
    {id:'portfolio',label:'Portfolio',target_screen:'home'}
   ]},
   screens:[{id:'home',name:'Home',nodes:[
    {id:'save',type:'button',parent_id:null,props:{label:'Save'},style:{}},
    {id:'override',type:'button',parent_id:null,props:{label:'Confirm'},style:{background_color:'#111111',color:'#222222'}},
    {id:'safe',type:'text',parent_id:null,props:{text:'Readable'}}
   ]}]
  };
  return inspectTextContrast(doc as any,'light');
 });
 const ids=result.map(x=>x.nodeId);
 expect(ids).toContain('portfolio');
 expect(ids).toContain('portfolio:active');
 expect(ids).toContain('save');
 expect(ids).toContain('override');
 expect(ids).not.toContain('safe');
 expect(result.find(x=>x.nodeId==='portfolio')?.screen).toBe('Shared navigation');
});

test('phase 10 contrast audit handles missing navigation and remains non-mutating',async({page})=>{
 await page.goto('/');
 const data=await page.evaluate(async()=>{
  const {inspectTextContrast}=await import('/src/contrastAudit.ts');
  const doc={themes:{light:{tokens:{'text.primary':'#172033'}}},
   screens:[{id:'home',name:'Home',nodes:[{id:'title',type:'text',parent_id:null,props:{text:'Title'}}]}]};
  const before=JSON.stringify(doc);
  return {findings:inspectTextContrast(doc as any,'light'),unchanged:before===JSON.stringify(doc)};
 });
 expect(data.unchanged).toBe(true);
 expect(data.findings).toEqual([]);
});

test('phase 10 long prototype button labels are constrained in canvas and standalone stylesheet',async({page})=>{
 await page.goto('/');
 const computed=await page.evaluate(()=>{
  const host=document.createElement('div');
  host.className='canvas sc-theme';
  const button=document.createElement('button');
  button.className='prototype-button';
  button.textContent='Very long sample button label which must wrap within the object';
  host.append(button);
  document.body.append(host);
  const style=getComputedStyle(button);
  const result={wrap:style.overflowWrap,whiteSpace:style.whiteSpace,boxSizing:style.boxSizing};
  host.remove();
  return result;
 });
 expect(computed.wrap).toBe('anywhere');
 expect(computed.whiteSpace).toBe('normal');
 expect(computed.boxSizing).toBe('border-box');
});

test('a dataset-bound DPPP row-count KPI reflects the seven fixture rows and subsequent additions',async({page})=>{
 await page.goto('/');
 const data=await page.evaluate(async()=>{
  const {aggregate}=await import('/src/Metrics.tsx');
  const rows=Array.from({length:7},(_,i)=>({'Work item / link ID':'demo-'+i}));
  const count=aggregate(rows,'count','');
  rows.push({'Work item / link ID':'demo-7'});
  return {initial:count,afterAdd:aggregate(rows,'count','')};
 });
 expect(data).toEqual({initial:7,afterAdd:8});
});
