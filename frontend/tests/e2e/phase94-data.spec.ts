import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function html(){
 const code=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
doc=starter_app()
doc['datasets']=[
 {'id':'hierarchy','columns':[{'id':'ID','type':'text'},{'id':'Parent','type':'text'},{'id':'Name','type':'text'}],
  'rows':[{'ID':'A','Parent':'','Name':'Group A'},{'ID':'B','Parent':'A','Name':'Child B'},{'ID':'C','Parent':'A','Name':'Child C'}],
  'persistence':'seed-reset'},
 {'id':'items','columns':[{'id':'Name','type':'text'}],
  'rows':[{'Name':'Alpha'},{'Name':'Beta'},{'Name':'Gamma'},{'Name':'Delta'}],'persistence':'seed-reset'}
]
doc['screens'][0]['nodes']=[
 {'id':'tree','type':'x-tree','parent_id':None,'props':{'label':'Hierarchy','dataset_id':'hierarchy','label_column':'Name','id_column':'ID','parent_column':'Parent'},
  'layout':{'x':10,'y':10,'width':250,'height':240}},
 {'id':'list','type':'x-list','parent_id':None,'props':{'label':'List','dataset_id':'items','label_column':'Name'},
  'layout':{'x':280,'y':10,'width':240,'height':220}},
 {'id':'table','type':'table','parent_id':None,'props':{'dataset_id':'items','page_size':2},
  'layout':{'x':10,'y':270,'width':450,'height':190}},
 {'id':'pages','type':'x-pagination','parent_id':None,'props':{'label':'Pages','target_table_id':'table'},
  'layout':{'x':10,'y':480,'width':400,'height':45}}
]
print(interactive_html(doc))
`;
 return execFileSync('python3',['-c',code],{encoding:'utf8',
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')}});
}

test('generated offline HTML tree expansion, list selection and pagination',async({page})=>{
 const calls:string[]=[];page.on('request',r=>calls.push(r.url()));
 await page.setContent(html(),{waitUntil:'load'});
 const tree=page.locator('[data-node-id="tree"]');
 await expect(tree).toContainText('Group A');
 await expect(tree).not.toContainText('Child B');
 await tree.getByRole('button',{name:'Expand A'}).click();
 await expect(tree).toContainText('Child B');
 await tree.getByRole('button',{name:'Child B'}).click();
 await expect(tree.getByRole('button',{name:'Child B'})).toHaveAttribute('aria-pressed','true');
 const list=page.locator('[data-node-id="list"]');
 await list.getByRole('button',{name:'Beta'}).click();
 await expect(list.getByRole('button',{name:'Beta'})).toHaveAttribute('aria-pressed','true');
 const table=page.locator('[data-node-id="table"]');
 await expect(table.locator('tbody tr')).toHaveCount(2);
 await expect(table.locator('tbody')).toContainText('Alpha');
 const pages=page.locator('[data-node-id="pages"]');
 await expect(pages).toContainText('Page 1 of 2');
 await pages.getByRole('button',{name:'Next'}).click();
 await expect(table.locator('tbody')).toContainText('Gamma');
 await expect(table.locator('tbody')).not.toContainText('Alpha');
 await expect(pages).toContainText('Page 2 of 2');
 await pages.getByRole('button',{name:'Previous'}).click();
 await expect(table.locator('tbody')).toContainText('Alpha');
 expect(calls).toEqual([]);
});
