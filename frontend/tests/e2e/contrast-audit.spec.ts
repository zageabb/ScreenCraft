import {test,expect} from '@playwright/test';

test('contrast audit catches dark text on dark imported nav surfaces',async({page})=>{
 await page.goto('/');
 const findings=await page.evaluate(async()=>{
  const {inspectTextContrast,contrastRatio}=await import('/src/contrastAudit.ts');
  const doc={
   themes:{
    light:{tokens:{'surface.page':'#FFFFFF','text.primary':'#202D3E'}},
    dark:{tokens:{'surface.page':'#101827','text.primary':'#F1F5F9'}}
   },
   screens:[{id:'home',name:'Home',nodes:[
    {id:'nav',type:'container',parent_id:null,style:{background_color:'#172A3D'}},
    {id:'label',type:'text',parent_id:'nav',style:{color_token:'text.primary'},props:{text:'Portfolio'}},
    {id:'page-label',type:'text',parent_id:null,style:{color_token:'text.primary'},props:{text:'Page heading'}}
   ]}]
  };
  return {light:inspectTextContrast(doc as any,'light'),dark:inspectTextContrast(doc as any,'dark'),
   blackWhite:contrastRatio('#000000','#FFFFFF')};
 });
 expect(findings.blackWhite).toBeCloseTo(21,2);
 expect(findings.light.map(x=>x.nodeId)).toContain('label');
 expect(findings.light.map(x=>x.nodeId)).not.toContain('page-label');
 expect(findings.dark.map(x=>x.nodeId)).not.toContain('label');
});

test('contrast audit uses explicit fixed text overrides and handles missing tokens safely',async({page})=>{
 await page.goto('/');
 const data=await page.evaluate(async()=>{
  const {inspectTextContrast}=await import('/src/contrastAudit.ts');
  return inspectTextContrast({
   themes:{dark:{tokens:{'surface.page':'#101827','text.primary':'#F1F5F9'}}},
   screens:[{id:'a',name:'A',nodes:[
    {id:'parent',type:'container',parent_id:null,style:{background_color:'#111111'}},
    {id:'bad',type:'text',parent_id:'parent',style:{color:'#222222'},props:{text:'hard-coded'}},
    {id:'good',type:'text',parent_id:'parent',style:{color_token:'text.primary'},props:{text:'token'}}
   ]}]
  } as any,'dark');
 });
 expect(data.map(x=>x.nodeId)).toEqual(['bad']);
});
