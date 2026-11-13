import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

test('all 39 canonical catalogue objects render without an unsupported placeholder in actual offline HTML',async({page})=>{
 const py=`
import json
from screencraft.package import starter_app
from screencraft.export import interactive_html
app=starter_app()
objects=json.load(open('src/catalogue.snapshot.json'))['objects']
assert len(objects)==39
app['screens'][0]['nodes']=[
 {'id':'sample-'+str(i),'type':obj['id'],'parent_id':None,
  'props':{'label':obj['id']},'layout':{'x':(i%4)*220,'y':(i//4)*125,'width':210,'height':120}}
 for i,obj in enumerate(objects)
]
print(interactive_html(app))
`;
 const html=execFileSync('python3',['-c',py],{
  encoding:'utf8',maxBuffer:12*1024*1024,
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')}
 });
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.setContent(html,{waitUntil:'load'});
 await expect(page.locator('.sc-unsupported')).toHaveCount(0);
 await expect(page.locator('[data-node-id="sample-0"]')).toHaveCount(1);
 const count=await page.locator('.sc-node').count();
 expect(count).toBeGreaterThanOrEqual(38); // Modal is deliberately hidden unless opened.
 expect(errors).toEqual([]);
});
