import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function html(){
 const py=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
doc=starter_app()
doc['screens'][0]['nodes']=[{
 'id':'legacy-map','type':'x-schema-map','parent_id':None,
 'props':{'label':'Relationship map','diagram_nodes':[
   {'id':'one','label':'Source table','x':40,'y':40,'fields':['id','name']},
   {'id':'two','label':'Link table','x':760,'y':200,'fields':['id','source_id']}
 ],'connections':[{'from':'one','to':'two'}]},
 'layout':{'x':0,'y':0,'width':900,'height':380}
}]
print(interactive_html(doc))
`;
 return execFileSync('python3',['-c',py],{
  encoding:'utf8',env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')}
 });
}
test('legacy imported schema map shows its actual tables and connections in standalone HTML',async({page})=>{
 await page.setContent(html(),{waitUntil:'load'});
 const schema=page.locator('[data-node-id="legacy-map"]');
 await expect(schema.locator('svg')).toContainText('Source table');
 await expect(schema.locator('svg')).toContainText('Link table');
 await expect(schema.locator('svg path')).toHaveCount(1);
 await expect(schema.locator('svg')).toHaveAttribute('viewBox',/0 0 930 /);
 await expect(schema).not.toContainText('Unsupported object');
 await schema.getByRole('button',{name:'Zoom in'}).click();
 await expect(schema.getByLabel('Zoom level')).toContainText('125%');
});
