import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

/** Exercise the real Python exporter, not a reimplementation of its HTML. */
function exportedHtml():string{
 const script=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
app=starter_app()
s=app['screens'][0]
s['nodes']=[
 {'id':'customer','type':'input','parent_id':None,'props':{'placeholder':'Customer'},'layout':{'x':20,'y':20,'width':170,'height':40}},
 {'id':'amount','type':'x-number','parent_id':None,'props':{'placeholder':'Amount'},'layout':{'x':210,'y':20,'width':150,'height':40}},
 {'id':'when','type':'x-date','parent_id':None,'props':{},'layout':{'x':380,'y':20,'width':170,'height':40}},
 {'id':'status','type':'select','parent_id':None,'props':{'options':['New','Active']},'layout':{'x':20,'y':75,'width':140,'height':40}},
 {'id':'approved','type':'checkbox','parent_id':None,'props':{'label':'Approved'},'layout':{'x':190,'y':75,'width':160,'height':40}},
 {'id':'notes','type':'x-textarea','parent_id':None,'props':{'placeholder':'Notes'},'layout':{'x':20,'y':125,'width':340,'height':75}},
 {'id':'table','type':'table','parent_id':None,'props':{'dataset_id':'orders'},'layout':{'x':20,'y':225,'width':650,'height':180}},
 {'id':'add','type':'button','parent_id':None,'props':{'label':'Add record'},'layout':{'x':20,'y':420,'width':190,'height':44},
  'action':{'type':'add_mock_row','dataset_id':'orders',
    'values':{'Origin':'Offline prototype','Customer':'Fixed fallback'},
    'field_bindings':{
      'Customer':'customer','Amount':'amount','Date':'when','Status':'status',
      'Approved':'approved','Notes':'notes'
    }}}
]
app['datasets']=[{'id':'orders','columns':[{'id':col,'type':'text'} for col in
  ('Customer','Amount','Date','Status','Approved','Notes','Origin')],
  'rows':[], 'persistence':'seed-reset'}]
print(interactive_html(app))
`;
 return execFileSync('python3',['-c',script],{
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},
  encoding:'utf8',maxBuffer:10*1024*1024
 });
}

test('offline HTML export maps six input controls into table columns and keeps current values',async({page})=>{
 await page.setContent(exportedHtml(),{waitUntil:'load'});
 const control=(id:string)=>page.locator('[data-node-id="'+id+'"]');
 await control('customer').fill('Acme Ltd');
 await control('amount').fill('250');
 await control('when').fill('2026-11-12');
 await control('status').selectOption('Active');
 await control('approved').locator('input').check();
 await control('notes').fill('Delivered by courier');
 await control('add').click();
 const table=control('table').locator('table');
 await expect(table.locator('tr')).toHaveCount(2);
 const cells=table.locator('tr').nth(1).locator('td');
 await expect(cells).toHaveText([
  'Acme Ltd','250','2026-11-12','Active','true','Delivered by courier','Offline prototype'
 ]);
 await expect(control('customer')).toHaveValue('Acme Ltd');
 await expect(control('approved').locator('input')).toBeChecked();
 await expect(control('notes')).toHaveValue('Delivered by courier');
 // Values from a second user interaction must override the first.
 await control('customer').locator('input').fill('Second Co');
 await control('approved').locator('input').uncheck();
 await control('add').getByRole('button',{name:'Add record'}).click();
 await expect(table.locator('tr')).toHaveCount(3);
 await expect(table.locator('tr').nth(2).locator('td').first()).toHaveText('Second Co');
 await expect(table.locator('tr').nth(2).locator('td').nth(4)).toHaveText('false');
});

test('export stays self-contained and uses no network for bound Add record',async({page})=>{
 const requests:string[]=[];
 page.on('request',req=>requests.push(req.url()));
 await page.setContent(exportedHtml(),{waitUntil:'load'});
 await page.locator('[data-node-id="customer"]').fill('Local test');
 await page.locator('[data-node-id="add"]').click();
 await expect(page.locator('[data-node-id="table"] tr')).toHaveCount(2);
 expect(requests).toEqual([]);
});
