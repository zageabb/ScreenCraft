import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function html(editable=true,persistence='seed-reset'){
 const source=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
app=starter_app()
app["datasets"]=[{"id":"customers","columns":[{"id":"Name","type":"text"},{"id":"Status","type":"text"}],
 "rows":[{"Name":"Zulu","Status":"Active"},{"Name":"Alpha","Status":"Draft"}],
 "persistence":"__PERSISTENCE__"}]
app["screens"][0]["nodes"]=[
 {"id":"customers-table","type":"table","parent_id":None,
  "props":{"dataset_id":"customers","sortable":True,"searchable":True,"selectable":True},
  "layout":{"x":10,"y":10,"width":450,"height":250}},
 {"id":"customer-grid","type":"x-editable-grid","parent_id":None,
  "props":{"dataset_id":"customers","sortable":True,"selectable":True},
  "layout":{"x":10,"y":300,"width":450,"height":250}},
 {"id":"detail","type":"x-record-detail","parent_id":None,
  "props":{"label":"Customer details","dataset_id":"customers","source_table_id":"customers-table",
   "editable":__EDITABLE__},"layout":{"x":500,"y":10,"width":300,"height":350}}
]
print(interactive_html(app))
`;
 return execFileSync('python3',['-c',source.replace('__EDITABLE__',editable?'True':'False').replace('__PERSISTENCE__',persistence)],{
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},encoding:'utf8',maxBuffer:10*1024*1024
 });
}
test('real offline HTML shows selected records and edits seed-reset data in linked table',async({page})=>{
 const requests:string[]=[];page.on('request',req=>requests.push(req.url()));
 await page.setContent(html(),{waitUntil:'load'});
 const table=page.locator('[data-node-id="customers-table"]');
 const detail=page.locator('[data-node-id="detail"]');
 await expect(detail).toContainText('Select a row');
 await table.getByRole('button',{name:'Sort Name'}).click();
 await table.locator('tbody tr').first().locator('td').nth(1).click();
 await expect(detail.getByRole('textbox',{name:'Detail Name'})).toHaveValue('Alpha');
 await detail.getByRole('textbox',{name:'Detail Status'}).fill('Approved');
 await detail.getByRole('textbox',{name:'Detail Status'}).blur();
 await expect(table.locator('tbody')).toContainText('Approved');
 await table.locator('tbody tr').last().locator('td').nth(1).click();
 await expect(detail.getByRole('textbox',{name:'Detail Name'})).toHaveValue('Zulu');
 await detail.getByRole('textbox',{name:'Detail Name'}).fill('Zenith');
 await detail.getByRole('textbox',{name:'Detail Name'}).blur();
 await expect(table.locator('tbody')).toContainText('Zenith');
 expect(requests).toEqual([]);
});
test('offline record-detail is read-only and does not write shared mock data',async({page})=>{
 await page.setContent(html(true,'project-shared'),{waitUntil:'load'});
 const detail=page.locator('[data-node-id="detail"]');
 await page.locator('[data-node-id="customers-table"] tbody tr').first().locator('td').nth(1).click();
 await expect(detail.getByRole('textbox',{name:'Detail Name'})).toBeDisabled();
 await expect(detail).toContainText('Editing requires a seed-reset dataset.');
});
test('offline record-detail without a selection is an informative empty state',async({page})=>{
 await page.setContent(html(false),{waitUntil:'load'});
 const detail=page.locator('[data-node-id="detail"]');
 await expect(detail).toContainText('Select a row in the linked table or grid.');
 await page.locator('[data-node-id="customers-table"] tbody tr').first().locator('td').nth(1).click();
 await expect(detail.getByLabel('Detail Name')).toContainText('Zulu');
 await expect(detail.getByRole('textbox',{name:'Detail Name'})).toHaveCount(0);
});
