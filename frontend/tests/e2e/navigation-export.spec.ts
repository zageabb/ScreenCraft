import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function exportedHtml(){
 const code=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
app=starter_app()
app['screens'][0]['nodes']=[
 {'id':'tabs','type':'tabs','parent_id':None,'props':{'tab_labels':['Overview','Details']},'layout':{'width':420,'height':220}},
 {'id':'overview','type':'text','parent_id':'tabs','props':{'text':'Overview content','tab_index':0}},
 {'id':'detail','type':'text','parent_id':'tabs','props':{'text':'Details content','tab_index':1}},
 {'id':'wizard','type':'x-wizard','parent_id':None,'props':{'tab_labels':['Start','Finish']},'layout':{'x':450,'width':420,'height':220}},
 {'id':'first','type':'text','parent_id':'wizard','props':{'text':'Start content','tab_index':0}},
 {'id':'second','type':'text','parent_id':'wizard','props':{'text':'Finish content','tab_index':1}},
 {'id':'accordion','type':'x-accordion','parent_id':None,'props':{'label':'Expand details','expanded':False},'layout':{'x':10,'y':260,'width':420,'height':200}},
 {'id':'collapsed','type':'text','parent_id':'accordion','props':{'text':'Hidden by default'}},
 {'id':'splitter','type':'x-splitter','parent_id':None,'props':{'split_percent':35},'layout':{'x':450,'y':260,'width':420,'height':200}},
 {'id':'sidebar','type':'x-sidebar','parent_id':None,'props':{'label':'Nav'},'layout':{'x':450,'y':500,'width':420,'height':200}}
]
print(interactive_html(app))
`;
 return execFileSync('python3',['-c',code],{env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},encoding:'utf8'});
}
test('standalone HTML tabs/wizard show only assigned content; accordion state is interactive',async({page})=>{
 const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
 await page.setContent(exportedHtml(),{waitUntil:'load'});
 const tabs=page.locator('[data-node-id="tabs"]'),wizard=page.locator('[data-node-id="wizard"]'),accordion=page.locator('[data-node-id="accordion"]');
 await expect(tabs.locator('[data-node-id="overview"]')).toBeVisible();
 await expect(tabs.locator('[data-node-id="detail"]')).toHaveCount(0);
 await tabs.getByRole('button',{name:'Details'}).click();
 await expect(tabs.locator('[data-node-id="detail"]')).toBeVisible();
 await expect(tabs.locator('[data-node-id="overview"]')).toHaveCount(0);
 await wizard.getByRole('button',{name:'Next step'}).click();
 await expect(wizard.locator('[data-node-id="second"]')).toBeVisible();
 await expect(wizard.locator('[data-node-id="first"]')).toHaveCount(0);
 await expect(accordion.getByRole('button',{name:/Expand details/})).toHaveAttribute('aria-expanded','false');
 await expect(accordion.locator('[data-node-id="collapsed"]')).toHaveCount(0);
 await accordion.getByRole('button',{name:/Expand details/}).click();
 await expect(accordion.locator('[data-node-id="collapsed"]')).toBeVisible();
 expect(requests).toEqual([]);
});
test('offline HTML renders configurable split and sidebar containers',async({page})=>{
 await page.setContent(exportedHtml(),{waitUntil:'load'});
 const split=page.locator('[data-node-id="splitter"]'),sidebar=page.locator('[data-node-id="sidebar"]');
 await expect(split.locator('.sc-layout-content')).toHaveAttribute('style',/grid-template-columns:\s*35%/);
 await expect(sidebar.locator('.sc-layout-content')).toHaveCSS('display','flex');
});
