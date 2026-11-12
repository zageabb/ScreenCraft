import {test,expect} from '@playwright/test';

const app={
 application_id:'demo',name:'Demo',start_screen:'home',default_theme:'light',
 screen_order:['home','customers'],
 screens:[
  {id:'home',name:'Home',viewport:{width:1280,height:800},layout:{mode:'freeform',overflow_x:'auto',overflow_y:'auto'},nodes:[
   {id:'welcome',type:'text',parent_id:null,props:{text:'Home dashboard'},layout:{x:20,y:20,width:280,height:40}},
   {id:'go',type:'button',parent_id:null,props:{label:'Open customers'},layout:{x:20,y:85,width:190,height:45},action:{type:'navigate',target_screen:'customers'}}
  ]},
  {id:'customers',name:'Customers',viewport:{width:1280,height:800},layout:{mode:'freeform',overflow_x:'auto',overflow_y:'auto'},nodes:[
   {id:'table',type:'table',parent_id:null,props:{dataset_id:'people'},layout:{x:20,y:20,width:370,height:220,overflow_x:'auto',overflow_y:'auto'}},
   {id:'add',type:'button',parent_id:null,props:{label:'Add sample'},layout:{x:20,y:260,width:190,height:45},action:{type:'add_mock_row',dataset_id:'people',values:{Name:'New Person',Status:'Draft'}}}
  ]}
 ],
 components:[],themes:{light:{tokens:{'surface.default':'#ffffff','text.primary':'#172033','action.primary':'#2563eb'}},
 dark:{tokens:{'surface.default':'#1e2737','text.primary':'#ffffff','action.primary':'#75aaff'}}},
 datasets:[{id:'people',columns:[{id:'Name',type:'text'},{id:'Status',type:'text'}],rows:[{Name:'Example Ltd',Status:'Active'}],persistence:'seed-reset'}],assets:[]
};
test.beforeEach(async({page})=>{
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()),method=route.request().method();
  let json:any={error:'Not mocked'};let status=200;
  if(url.pathname==='/api/me')json={username:'tester',id:'u1',is_admin:true};
  else if(url.pathname==='/api/projects')json={projects:[{id:'p1',name:'Demo',revision:1,role:'owner'}]};
  else if(url.pathname==='/api/projects/p1' && method==='GET')json={id:'p1',revision:1,role:'owner',document:app};
  else if(url.pathname==='/api/projects/p1' && method==='PUT')json={revision:2};
  else status=404;
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(json)});
 });
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Applications'})).toBeVisible();
 await page.getByRole('button',{name:'Open',exact:true}).click();
 await expect(page.locator('.canvas-node')).toHaveCount(2);
});
test('palette inserts draggable object and theme switches',async({page})=>{
 await page.locator('.palette button').filter({hasText:'text'}).click();
 await expect(page.locator('.canvas-node')).toHaveCount(3);
 await page.locator('.toolbar select').selectOption('dark');
 await expect(page.locator('.canvas')).toHaveCSS('background-color','rgb(30, 39, 55)');
});
test('interactive preview navigates screens and adds mock record',async({page})=>{
 await page.getByRole('button',{name:'▶ Preview'}).click();
 await page.locator('.canvas .prototype-button').filter({hasText:'Open customers'}).click();
 await expect(page.locator('.canvas table tbody tr')).toHaveCount(1);
 await page.locator('.canvas .prototype-button').filter({hasText:'Add sample'}).click();
 await expect(page.locator('.canvas table tbody tr')).toHaveCount(2);
 await expect(page.locator('.canvas table')).toContainText('New Person');
});
