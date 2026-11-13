import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function html(){
 const py=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
doc=starter_app()
doc["datasets"]=[{"id":"records","columns":[{"id":x,"type":"text"} for x in ["Name","Time","Priority","Enabled","Attachment"]],"rows":[
 {"Name":"Alpha","Time":"09:00","Priority":"High","Enabled":True,"Attachment":""},
 {"Name":"Beta","Time":"10:00","Priority":"Low","Enabled":False,"Attachment":""}],"persistence":"seed-reset"}]
doc["screens"][0]["nodes"]=[
 {"id":"time","type":"x-time","parent_id":None,"props":{"label":"Start time","required":True,"min":"08:00","max":"18:00"},"layout":{"x":10,"y":10,"width":180,"height":45}},
 {"id":"priority","type":"x-radio","parent_id":None,"props":{"label":"Priority","options":["High","Low"],"required":True},"layout":{"x":210,"y":10,"width":180,"height":80}},
 {"id":"toggle","type":"x-toggle","parent_id":None,"props":{"label":"Enabled"},"layout":{"x":400,"y":10,"width":170,"height":45}},
 {"id":"attachment","type":"x-file-upload","parent_id":None,"props":{"label":"Attachment","accept":".txt"},"layout":{"x":10,"y":110,"width":290,"height":95}},
 {"id":"search","type":"x-search","parent_id":None,"props":{"label":"Find","target_table_id":"table"},"layout":{"x":320,"y":110,"width":250,"height":45}},
 {"id":"table","type":"table","parent_id":None,"props":{"dataset_id":"records","selectable":True},"layout":{"x":10,"y":225,"width":620,"height":220}},
 {"id":"add","type":"button","parent_id":None,"props":{"label":"Add record"},"action":{"type":"add_mock_row","dataset_id":"records",
  "values":{"Name":"Gamma"},"field_bindings":{"Time":"time","Priority":"priority","Enabled":"toggle","Attachment":"attachment"}},
  "layout":{"x":10,"y":460,"width":170,"height":45}}
]
print(interactive_html(doc))
`;
 return execFileSync('python3',['-c',py],{env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},encoding:'utf8'});
}
test('real exported HTML renders all five inputs and binds values without network access',async({page})=>{
 const calls:string[]=[];page.on('request',r=>calls.push(r.url()));
 await page.setContent(html(),{waitUntil:'load'});
 await expect(page.locator('[data-node-id="table"] tbody tr')).toHaveCount(2);
 await page.locator('[data-node-id="add"]').click();
 await expect(page.locator('#root')).toContainText('Start time is required');
 await page.locator('[data-node-id="time"]').fill('11:30');
 await page.locator('[data-node-id="priority"] input[value="High"]').check();
 await page.locator('[data-node-id="toggle"] input').check();
 await page.locator('[data-node-id="attachment"] input[type="file"]').setInputFiles({name:'note.txt',mimeType:'text/plain',buffer:Buffer.from('hello')});
 await expect(page.locator('[data-node-id="attachment"]')).toContainText('note.txt');
 await page.locator('[data-node-id="add"]').click();
 const last=page.locator('[data-node-id="table"] tbody tr').last();
 await expect(last).toContainText('Gamma');
 await expect(last).toContainText('11:30');
 await expect(last).toContainText('High');
 await expect(last).toContainText('true');
 await expect(last).toContainText('note.txt');
 await page.locator('[data-node-id="search"]').fill('Alpha');
 await expect(page.locator('[data-node-id="table"] tbody tr')).toHaveCount(1);
 await expect(page.locator('[data-node-id="table"] tbody tr')).toContainText('Alpha');
 expect(calls).toEqual([]);
});
test('radio and time bounds block invalid mock insert',async({page})=>{
 await page.setContent(html(),{waitUntil:'load'});
 await page.locator('[data-node-id="time"]').fill('07:30');
 await page.locator('[data-node-id="priority"] input[value="Low"]').check();
 await page.locator('[data-node-id="add"]').click();
 await expect(page.locator('#root')).toContainText('Start time cannot be before 08:00');
 await expect(page.locator('[data-node-id="table"] tbody tr')).toHaveCount(2);
});
