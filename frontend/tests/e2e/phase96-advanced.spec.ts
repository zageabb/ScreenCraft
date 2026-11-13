import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function html(){
 const source=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
app=starter_app()
app['datasets']=[{'id':'events','columns':[{'id':'Date','type':'date'},{'id':'Title','type':'text'}],
 'rows':[{'Date':'2026-11-15','Title':'Finish'},{'Date':'2026-11-12','Title':'Start'}],
 'persistence':'seed-reset'}]
app['screens'][0]['nodes']=[
 {'id':'diagram','type':'x-diagram','parent_id':None,
  'props':{'label':'Process','nodes':[{'id':'a','label':'Start','x':25,'y':45},{'id':'b','label':'End','x':270,'y':45}],
   'links':[{'source':'a','target':'b'}]},'layout':{'x':10,'y':10,'width':450,'height':230}},
 {'id':'schema','type':'x-schema-map','parent_id':None,
  'props':{'label':'Schema','tables':[{'id':'a','label':'Customers','fields':['ID','Name'],'x':25,'y':45},
   {'id':'b','label':'Orders','fields':['ID','Customer ID'],'x':270,'y':45}],
   'links':[{'source':'a','target':'b'}]},'layout':{'x':480,'y':10,'width':460,'height':230}},
 {'id':'timeline','type':'x-timeline','parent_id':None,'props':{'label':'Milestones','dataset_id':'events',
  'date_column':'Date','title_column':'Title'},'layout':{'x':10,'y':270,'width':430,'height':230}},
 {'id':'preview','type':'x-file-preview','parent_id':None,'props':{'label':'File preview'},
  'layout':{'x':470,'y':270,'width':430,'height':250}}
]
print(interactive_html(app))
`;
 return execFileSync('python3',['-c',source],{
  encoding:'utf8',env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')}
 });
}
test('real offline advanced objects display graph links, schema fields and sorted timeline',async({page})=>{
 const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
 await page.setContent(html(),{waitUntil:'load'});
 const diagram=page.locator('[data-node-id="diagram"]');
 const schema=page.locator('[data-node-id="schema"]');
 await expect(diagram.locator('svg path')).toHaveCount(1);
 await expect(schema.locator('svg path')).toHaveCount(1);
 await expect(schema).toContainText('Schema');
 await expect(schema.locator('svg')).toContainText('Customer ID');
 await diagram.getByRole('button',{name:'Zoom in'}).click();
 await expect(diagram.getByLabel('Zoom level')).toContainText('125%');
 const timeline=page.locator('[data-node-id="timeline"]');
 await expect(timeline.locator('li')).toHaveCount(2);
 await expect(timeline.locator('li').first()).toContainText('Start');
 await expect(timeline.locator('li').last()).toContainText('Finish');
 expect(requests).toEqual([]);
});
test('offline file preview displays local text without a server upload',async({page})=>{
 const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
 await page.setContent(html(),{waitUntil:'load'});
 const preview=page.locator('[data-node-id="preview"]');
 await expect(preview).toContainText('Nothing is uploaded');
 await preview.getByLabel('Choose preview file').setInputFiles({
  name:'sample.txt',mimeType:'text/plain',buffer:Buffer.from('Sample local preview')});
 await expect(preview.locator('pre')).toContainText('Sample local preview');
 expect(requests).toEqual([]);
});
