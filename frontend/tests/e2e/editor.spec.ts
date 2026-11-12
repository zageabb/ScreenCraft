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

test('drag from component gallery and resize on canvas',async({page})=>{
 const canvas=page.locator('.canvas');
 const palette=page.locator('.palette button').filter({hasText:'text'});
 await palette.dragTo(canvas,{targetPosition:{x:360,y:180}});
 await expect(canvas.locator('.canvas-node')).toHaveCount(3);
 const added=canvas.locator('.canvas-node').last();
 await added.click();
 const handle=added.locator('.resize-handle');
 await expect(handle).toBeVisible();
 const oldWidth=await added.evaluate(e=>e.getBoundingClientRect().width);
 const box=await handle.boundingBox();
 if(!box)throw Error('Missing resize handle');
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.mouse.down();
 await page.mouse.move(box.x+box.width/2+80,box.y+box.height/2+40,{steps:8});
 await page.mouse.up();
 const newWidth=await added.evaluate(e=>e.getBoundingClientRect().width);
 expect(newWidth).toBeGreaterThan(oldWidth);
});

test('reports exact API endpoint and status when proxy returns HTML instead of JSON',async({page})=>{
 await page.goto('/');
 // Start with app/project list, then intercept only the create request.
 await page.route('**/api/projects',async route=>{
    if(route.request().method()==='POST') {
      await route.fulfill({status:502,contentType:'text/html',body:'<!doctype html><html><body>Proxy error</body></html>'});
    } else {
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({projects:[]})});
    }
 });
 await page.getByRole('button',{name:'Create application'}).click();
 const error=page.locator('.status');
 await expect(error).toContainText('POST /api/projects');
 await expect(error).toContainText('HTTP 502');
 await expect(error).toContainText('text/html');
 await expect(error).not.toContainText('Unexpected token');
});

test('new table shows seed records and inspector edits persist in save payload',async({page})=>{
 await page.locator('.palette button').filter({hasText:'table'}).click();
 const table=page.locator('.canvas table').first();
 await expect(table).toBeVisible();
 await expect(table).toContainText('Example record');
 const row=page.getByRole('textbox',{name:'Row 1 Name'});
 await row.fill('Edited sample customer');
 await expect(table).toContainText('Edited sample customer');
 await page.getByRole('button',{name:'+ Sample row'}).click();
 await page.getByRole('textbox',{name:'Row 2 Name'}).fill('Second customer');
 await expect(table.locator('tbody tr')).toHaveCount(2);
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const request=await saved;
 const payload=request.postDataJSON();
 const node=payload.document.screens[0].nodes.find((n:any)=>n.type==='table');
 expect(node).toBeTruthy();
 const dataset=payload.document.datasets.find((d:any)=>d.id===node.props.dataset_id);
 expect(dataset.rows[0].Name).toBe('Edited sample customer');
 expect(dataset.rows[1].Name).toBe('Second customer');
});
test('existing unbound table can create its own dataset',async({page})=>{
 // Simulate a design made with the earlier ScreenCraft release.
 await page.route('**/api/projects/p1',async route=>{
   if(route.request().method()==='GET'){
     const old=structuredClone(app);
     old.screens[0].nodes.push({id:'legacy-table',type:'table',parent_id:null,
       props:{},layout:{x:80,y:180,width:420,height:220}});
     await route.fulfill({status:200,contentType:'application/json',
       body:JSON.stringify({id:'p1',revision:1,role:'owner',document:old})});
   }else{
     await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({revision:2})});
   }
 });
 await page.reload();
 await page.getByRole('button',{name:'Open',exact:true}).click();
 await expect(page.locator('.table-empty')).toBeVisible();
 await page.getByRole('button',{name:'table · legacy-ta'}).click();
 await page.getByRole('button',{name:'Create sample dataset'}).click();
 await expect(page.locator('.canvas table')).toContainText('Example record');
});
