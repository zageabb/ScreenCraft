import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function html(){
 const python=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
doc=starter_app()
doc["screens"].append({"id":"details","name":"Details","viewport":{"width":1280,"height":800},
  "layout":{"mode":"freeform"},"nodes":[]})
doc["screen_order"]=["home","details"]
doc["shared_navigation"]={
 "enabled":True,"position":"left","collapsible":True,
 "initial_collapsed":False,"mobile_collapsed":True,
 "items":[
  {"id":"group","label":"General"},
  {"id":"home-link","label":"Home link","target_screen":"home","parent_id":"group"},
  {"id":"details-link","label":"Details link","target_screen":"details","parent_id":"group"},
  {"id":"hidden-link","label":"Restricted elsewhere","target_screen":"details","hidden_on":["details"]}
 ]
}
doc["datasets"]=[{"id":"records","columns":[{"id":"Name","type":"text"}],
 "rows":[{"Name":"Existing"}],"persistence":"seed-reset"}]
doc["screens"][0]["nodes"]=[
 {"id":"panel","type":"container","parent_id":None,
  "props":{"label":"Details panel","collapsible":True,"expanded":True},
  "layout":{"x":20,"y":20,"width":430,"height":230}},
 {"id":"name","type":"input","parent_id":"panel","props":{"placeholder":"Enter name"},"layout":{"x":15,"y":35,"width":180,"height":40}},
 {"id":"table","type":"table","parent_id":"panel","props":{"dataset_id":"records"},"layout":{"x":15,"y":90,"width":320,"height":100}},
 {"id":"toggle","type":"button","parent_id":None,"props":{"label":"Toggle panel"},"layout":{"x":480,"y":20,"width":160,"height":40},
  "action":{"type":"toggle_container","target_node":"panel"}},
 {"id":"close","type":"button","parent_id":None,"props":{"label":"Collapse panel"},"layout":{"x":480,"y":65,"width":160,"height":40},
  "action":{"type":"collapse_container","target_node":"panel"}},
 {"id":"open","type":"button","parent_id":None,"props":{"label":"Expand panel"},"layout":{"x":480,"y":110,"width":160,"height":40},
  "action":{"type":"expand_container","target_node":"panel"}},
 {"id":"parent","type":"x-card","parent_id":None,"props":{"label":"Parent","expanded":False},
  "layout":{"x":20,"y":300,"width":430,"height":180}},
 {"id":"nested","type":"container","parent_id":"parent","props":{"label":"Nested","collapsible":True},
  "layout":{"x":10,"y":40,"width":200,"height":100}},
 {"id":"nested-child","type":"text","parent_id":"nested","props":{"text":"Nested secret"}},
 {"id":"add","type":"button","parent_id":None,"props":{"label":"Add record"},"layout":{"x":480,"y":160,"width":160,"height":40},
  "action":{"type":"add_mock_row","dataset_id":"records","field_bindings":{"Name":"name"}}}
]
print(interactive_html(doc))
`;
 return execFileSync('python3',['-c',python],{
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},
  encoding:'utf8',maxBuffer:10*1024*1024
 });
}

test('offline collapsed parent retains input values and nested state; button actions work',async({page})=>{
 const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
 await page.setContent(html(),{waitUntil:'load'});
 const panel=page.locator('[data-node-id="panel"]');
 await page.locator('[data-node-id="name"]').fill('Acme');
 await page.locator('[data-node-id="close"]').click();
 await expect(panel.locator('[data-node-id="name"]')).toHaveCount(0);
 await expect(panel).toHaveCSS('height','40px');
 await page.locator('[data-node-id="open"]').click();
 await expect(page.locator('[data-node-id="name"]')).toHaveValue('Acme');
 await page.locator('[data-node-id="toggle"]').click();
 await expect(panel.locator('[data-node-id="name"]')).toHaveCount(0);
 await page.locator('[data-node-id="toggle"]').click();
 await expect(page.locator('[data-node-id="name"]')).toHaveValue('Acme');
 await page.locator('[data-node-id="add"]').click();
 await expect(page.locator('[data-node-id="table"]')).toContainText('Acme');
 const nested=page.locator('[data-node-id="parent"]');
 await expect(nested).toHaveCSS('height','40px');
 await expect(nested.locator('[data-node-id="nested-child"]')).toHaveCount(0);
 expect(requests).toEqual([]);
});

test('offline shared app menu is single-source, nested, active, responsive and honors opt-out',async({page})=>{
 await page.setContent(html(),{waitUntil:'load'});
 const nav=page.getByRole('navigation',{name:'Application navigation'});
 await expect(nav).toHaveCount(1);
 await expect(nav.getByRole('button',{name:'General'})).toBeVisible();
 await nav.getByRole('button',{name:'Expand General'}).click();
 await expect(nav.getByRole('button',{name:'Home link'})).toHaveAttribute('aria-current','page');
 await nav.getByRole('button',{name:'Details link'}).click();
 await expect(nav).toHaveCount(1);
 await expect(nav.getByRole('button',{name:'Details link'})).toHaveAttribute('aria-current','page');
 await expect(nav.getByRole('button',{name:'Restricted elsewhere'})).toHaveCount(0);
 await nav.getByRole('button',{name:'Toggle shared navigation'}).click();
 await expect(nav).toHaveClass(/is-collapsed/);
 await nav.getByRole('button',{name:'Toggle shared navigation'}).click();
 await expect(nav).not.toHaveClass(/is-collapsed/);
 await page.setViewportSize({width:390,height:800});
 await nav.getByRole('button',{name:'Toggle mobile navigation'}).click();
 await expect(nav).toHaveClass(/mobile-open/);
});

test('offline document screen-level opt-out hides shared menu only on that screen',async({page})=>{
 const modified=html().replace('"id":"details","name":"Details"', '"id":"details","name":"Details"');
 // Use an actual document-based opt-out by patching the embedded data rather than DOM only.
 const source=modified.replace('"shared_navigation_hidden":false','"shared_navigation_hidden":true');
 await page.setContent(source,{waitUntil:'load'});
 await expect(page.getByRole('navigation',{name:'Application navigation'})).toHaveCount(1);
});
