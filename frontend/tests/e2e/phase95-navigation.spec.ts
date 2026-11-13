import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function html(){
 const py=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
doc=starter_app()
doc['screens'].append({'id':'customers','name':'Customers','viewport':{'width':1024,'height':768},
 'layout':{'mode':'freeform'},'nodes':[
  {'id':'customers-crumbs','type':'x-breadcrumbs','parent_id':None,'props':{'label':'Breadcrumbs'},'layout':{'x':20,'y':20,'width':500,'height':50}},
  {'id':'customer-text','type':'text','parent_id':None,'props':{'text':'Customer overview'},'layout':{'x':20,'y':90,'width':320,'height':40}}
 ]})
doc['screen_order']=['home','customers']
doc['screens'][0]['nodes']=[
 {'id':'menu','type':'x-menu','parent_id':None,'props':{'label':'Local menu','use_shared':False,'items':[
  {'id':'group','label':'Pages'},
  {'id':'home-link','label':'Home','target_screen':'home','parent_id':'group'},
  {'id':'customer-link','label':'Customers','target_screen':'customers','parent_id':'group'}
 ]},'layout':{'x':20,'y':20,'width':300,'height':230}},
 {'id':'crumbs','type':'x-breadcrumbs','parent_id':None,'props':{'label':'Breadcrumbs'},'layout':{'x':20,'y':270,'width':500,'height':50}}
]
print(interactive_html(doc))
`;
 return execFileSync('python3',['-c',py],{encoding:'utf8',env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')}});
}
test('generated HTML local menu navigates screens and breadcrumbs follow history',async({page})=>{
 const requests:string[]=[];page.on('request',req=>requests.push(req.url()));
 await page.setContent(html(),{waitUntil:'load'});
 const menu=page.locator('[data-node-id="menu"]');
 await expect(menu).toContainText('Pages');
 await menu.getByRole('button',{name:'Expand Pages'}).click();
 await expect(menu.getByRole('button',{name:'Home'})).toHaveAttribute('aria-current','page');
 await menu.getByRole('button',{name:'Customers'}).click();
 const crumb=page.locator('[data-node-id="customers-crumbs"]');
 await expect(crumb).toContainText('Home');
 await expect(crumb).toContainText('Customers');
 await crumb.getByRole('button',{name:'Home'}).click();
 await expect(page.locator('[data-node-id="menu"]')).toBeVisible();
 expect(requests).toEqual([]);
});
