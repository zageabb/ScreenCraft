import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

test('x-spreadsheet offline export is static and makes no network requests',async({page})=>{
 const py=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
app=starter_app()
app['screens'][0]['nodes']=[{
 'id':'workbook-preview','type':'x-spreadsheet','parent_id':None,
 'props':{'label':'Purchase orders','engine':'univer','workbook_ref':'po-demo',
          'mode':'editable','show_formula_bar':True,'show_sheet_tabs':True,
          'show_ribbon':False,'allow_xlsx_export':False},
 'layout':{'x':10,'y':10,'width':600,'height':330}}]
print(interactive_html(app))
`;
 const html=execFileSync('python3',['-c',py],{
  encoding:'utf8',maxBuffer:12*1024*1024,
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')}
 });
 const requests:string[]=[];
 page.on('request',r=>requests.push(r.url()));
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setContent(html,{waitUntil:'load'});
 const preview=page.locator('[data-node-id="workbook-preview"]');
 await expect(preview).toBeVisible();
 await expect(preview).toContainText('Purchase orders');
 await expect(preview).toContainText('Univer planned');
 await expect(preview).toContainText('Sheet1');
 await expect(preview).toContainText('po-demo');
 await expect(preview.locator('table')).toHaveCount(1);
 await expect(page.locator('.sc-unsupported')).toHaveCount(0);
 expect(requests).toEqual([]);
 expect(errors).toEqual([]);
});
