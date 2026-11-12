import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function generatedHtml(){
 const source=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
doc=starter_app()
doc["datasets"]=[{"id":"orders","columns":[{"id":"Name","type":"text"},{"id":"Status","type":"text"}],
 "rows":[{"Name":"Zephyr","Status":"Active"},{"Name":"Alpha","Status":"Draft"},{"Name":"Beta","Status":"Active"}],
 "persistence":"seed-reset"}]
doc["screens"][0]["nodes"]=[
 {"id":"grid","type":"x-editable-grid","parent_id":None,
  "props":{"dataset_id":"orders","searchable":True,"sortable":True,"selectable":True,"page_size":2},
  "layout":{"width":750,"height":380}},
 {"id":"table","type":"table","parent_id":None,
  "props":{"dataset_id":"orders","searchable":True,"sortable":True,"filter_column":"Status","filter_value":"Active"},
  "layout":{"x":10,"y":400,"width":750,"height":200}}
]
print(interactive_html(doc))
`;
 return execFileSync('python3',['-c',source],{
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},
  encoding:'utf8',maxBuffer:10*1024*1024
 });
}

test('real offline HTML export supports sorting, page navigation, filtering and editable grid mutations',async({page})=>{
 const requests:string[]=[];
 page.on('request',r=>requests.push(r.url()));
 await page.setContent(generatedHtml(),{waitUntil:'load'});
 const grid=page.locator('[data-node-id="grid"]'),table=page.locator('[data-node-id="table"]');
 await expect(grid.locator('tbody tr')).toHaveCount(2);
 await expect(table.locator('tbody tr')).toHaveCount(2);
 await grid.getByRole('button',{name:'Sort Name'}).click();
 await expect(grid.locator('tbody tr').first().getByRole('textbox',{name:/Edit row .* Name/})).toHaveValue('Alpha');
 await grid.getByRole('button',{name:'Next page'}).click();
 await expect(grid.locator('tbody tr')).toHaveCount(1);
 await expect(grid.locator('tbody tr').first().getByRole('textbox',{name:/Edit row .* Name/})).toHaveValue('Zephyr');
 await grid.getByRole('button',{name:'Previous page'}).click();
 await grid.getByRole('textbox',{name:'Search records'}).fill('Beta');
 await expect(grid.locator('tbody tr')).toHaveCount(1);
 await expect(grid.locator('tbody tr').first().getByRole('textbox',{name:/Edit row .* Name/})).toHaveValue('Beta');
 await grid.getByRole('textbox',{name:'Search records'}).fill('');
 await grid.getByRole('checkbox',{name:'Select row 2'}).check();
 await grid.getByRole('button',{name:'Delete selected'}).click();
 await expect(grid).toContainText('2 of 2 record(s)');
 await grid.getByRole('button',{name:'+ Row'}).click();
 await expect(grid).toContainText('3 of 3 record(s)');
 // Editing the newly added row immediately updates the shared mock dataset.
 await grid.getByRole('textbox',{name:'Edit row 3 Name'}).fill('New Customer');
 await grid.getByRole('textbox',{name:'Edit row 3 Status'}).fill('Active');
 await table.getByRole('textbox',{name:'Search records'}).fill('New Customer');
 // Search triggers a fresh table view over the shared offline dataset.
 await expect(table.locator('tbody tr')).toHaveCount(1);
 await expect(table).toContainText('New Customer');
 expect(requests).toEqual([]);
});

test('exported table filter is applied without enabling editing',async({page})=>{
 await page.setContent(generatedHtml(),{waitUntil:'load'});
 const table=page.locator('[data-node-id="table"]');
 await expect(table.locator('tbody tr')).toHaveCount(2);
 await expect(table.getByRole('button',{name:'+ Row'})).toHaveCount(0);
 await table.getByRole('button',{name:'Sort Name'}).click();
 await expect(table.locator('tbody tr').first()).toContainText('Beta');
 await table.getByRole('textbox',{name:'Search records'}).fill('Zephyr');
 await expect(table.locator('tbody tr')).toHaveCount(1);
 await expect(table.locator('tbody tr').first()).toContainText('Zephyr');
});
