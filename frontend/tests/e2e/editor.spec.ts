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
  if(url.pathname==='/api/auth-mode')json={mode:'local'};
  else if(url.pathname==='/api/me')json={username:'tester',id:'u1',is_admin:true};
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
 await page.locator('[data-catalogue-type="text"]').click();
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
 const palette=page.locator('[data-catalogue-type="text"]');
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
 await page.locator('[data-catalogue-type="table"]').click();
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

test('rename screen, persist its name, and preserve navigation target IDs',async({page})=>{
 await page.getByRole('button',{name:'Customers',exact:true}).first().click();
 const field=page.getByRole('textbox',{name:'Screen name'});
 await expect(field).toHaveValue('Customers');
 await field.fill('Customer Accounts');
 await field.press('Enter');
 await expect(page.locator('.sidebar button').filter({hasText:'Customer Accounts'})).toBeVisible();
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const data=(await saved).postDataJSON().document;
 expect(data.screens.find((s:any)=>s.id==='customers').name).toBe('Customer Accounts');
 expect(data.screens.find((s:any)=>s.id==='home').nodes.find((n:any)=>n.id==='go').action.target_screen).toBe('customers');
});
test('additional new screens have distinct names and can be renamed',async({page})=>{
 await page.getByRole('button',{name:'+ Screen'}).click();
 await expect(page.getByRole('textbox',{name:'Screen name'})).toHaveValue('New Screen');
 await page.getByRole('button',{name:'+ Screen'}).click();
 await expect(page.getByRole('textbox',{name:'Screen name'})).toHaveValue('New Screen 2');
 await page.getByRole('textbox',{name:'Screen name'}).fill('Reporting');
 await page.getByRole('textbox',{name:'Screen name'}).press('Enter');
 await expect(page.locator('.sidebar button').filter({hasText:'Reporting'})).toBeVisible();
});

test('UDA mode does not display a second ScreenCraft password form',async({page})=>{
 await page.route('**/api/auth-mode',async route=>
   route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mode:'uda'})}));
 await page.route('**/api/me',async route=>
   route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Verified UDA identity required'})}));
 await page.reload();
 await expect(page.getByRole('heading',{name:'ScreenCraft'})).toBeVisible();
 await expect(page.getByText('Sign in through UDA')).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Username'})).toHaveCount(0);
 await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('Phase 5 screen ordering is saved separately from stable navigation IDs',async({page})=>{
 await page.getByRole('button',{name:'Move screen Customers up'}).click();
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const savedDoc=(await saved).postDataJSON().document;
 expect(savedDoc.screen_order).toEqual(['customers','home']);
 expect(savedDoc.start_screen).toBe('home');
 expect(savedDoc.screens.find((s:any)=>s.id==='home').nodes.find((n:any)=>n.id==='go').action.target_screen).toBe('customers');
});
test('Phase 5 right inspector deletion removes existing objects and persists',async({page})=>{
 await page.getByRole('button',{name:'text · welcome'}).click();
 await expect(page.getByRole('button',{name:'Delete selected object'})).toBeVisible();
 await page.getByRole('button',{name:'Delete selected object'}).click();
 await expect(page.locator('.canvas')).not.toContainText('Home dashboard');
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const savedDoc=(await saved).postDataJSON().document;
 expect(savedDoc.screens.find((s:any)=>s.id==='home').nodes.some((n:any)=>n.id==='welcome')).toBe(false);
});
test('Phase 5 nested card and reusable component keep parent relationships',async({page})=>{
 await page.locator('[data-catalogue-type="x-card"]').click();
 const card=page.locator('.canvas-node').filter({has:page.locator('.nested-x-card')});
 await expect(card).toContainText('Card');
 await page.locator('[data-catalogue-type="text"]').click();
 await page.getByRole('combobox',{name:'Parent container'}).selectOption({index:1});
 await expect(card.locator('.canvas-node')).toHaveCount(1);
 await page.getByRole('button',{name:'Save as reusable component'}).click();
 await expect(page.getByRole('heading',{name:'Reusable components'})).toBeVisible();
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const savedDoc=(await saved).postDataJSON().document;
 const cardNode=savedDoc.screens[0].nodes.find((n:any)=>n.type==='x-card');
 expect(savedDoc.screens[0].nodes.some((n:any)=>n.parent_id===cardNode.id)).toBe(true);
 expect(savedDoc.components.length).toBe(1);
});
test('Phase 5 preview always has a route home after navigation',async({page})=>{
 await page.getByRole('button',{name:'▶ Preview'}).click();
 await page.locator('.prototype-button').getByText('Open customers').click();
 await expect(page.getByRole('button',{name:'Preview home'})).toBeVisible();
 await page.getByRole('button',{name:'Preview home'}).click();
 await expect(page.locator('.prototype-button')).toContainText(['Open customers']);
 await expect(page.getByRole('button',{name:'Preview back'})).toBeDisabled();
});
test('Phase 5 unsupported extension stays editable and visibly warned',async({page})=>{
 await page.locator('.palette details').filter({has:page.locator('[data-catalogue-type="x-diagram"]')}).locator('summary').click();
 await page.locator('[data-catalogue-type="x-diagram"]').click();
 await expect(page.locator('.canvas .unsupported-object').first()).toContainText('Unsupported object: x-diagram');
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const savedDoc=(await saved).postDataJSON().document;
 expect(savedDoc.screens[0].nodes.some((n:any)=>n.type==='x-diagram')).toBe(true);
});

test('existing Get started demo object is removable without deleting a screen',async({page})=>{
 await page.route('**/api/projects/p1',async route=>{
  if(route.request().method()==='GET'){
   const old=structuredClone(app);
   old.screens[0].nodes.push({id:'start',type:'button',parent_id:null,
     props:{label:'Get started'},layout:{x:70,y:180,width:180,height:44},
     action:{type:'message',text:'Preview ready'}});
   await route.fulfill({status:200,contentType:'application/json',
     body:JSON.stringify({id:'p1',revision:1,role:'owner',document:old})});
  }else await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({revision:2})});
 });
 await page.reload();
 await page.getByRole('button',{name:'Open',exact:true}).click();
 await expect(page.locator('.prototype-button').filter({hasText:'Get started'})).toBeVisible();
 await page.getByRole('button',{name:'button · start'}).click();
 await page.getByRole('button',{name:'Delete selected object'}).click();
 await expect(page.locator('.prototype-button').filter({hasText:'Get started'})).toHaveCount(0);
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const payload=(await saved).postDataJSON().document;
 expect(payload.screens[0].nodes.some((n:any)=>n.id==='start')).toBe(false);
});

test('core text retains its content and is not an unsupported placeholder',async({page})=>{
 await expect(page.locator('.canvas')).toContainText('Home dashboard');
 await expect(page.locator('.canvas .unsupported-object')).toHaveCount(0);
});

test('screen delete removes target, clears inbound actions, saves and can undo',async({page})=>{
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Delete screen Customers'}).click();
 await expect(page.getByRole('button',{name:'Delete screen Customers'})).toHaveCount(0);
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const doc=(await saved).postDataJSON().document;
 expect(doc.screens.map((s:any)=>s.id)).toEqual(['home']);
 expect(doc.screen_order).toEqual(['home']);
 expect(doc.screens[0].nodes.find((n:any)=>n.id==='go').action).toBeUndefined();
 await page.getByRole('button',{name:'Undo'}).click();
 await expect(page.getByRole('button',{name:'Delete screen Customers'})).toBeVisible();
});
test('screen delete updates start_screen and switches to the remaining screen',async({page})=>{
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Delete screen Home'}).click();
 await expect(page.getByRole('textbox',{name:'Screen name'})).toHaveValue('Customers');
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const doc=(await saved).postDataJSON().document;
 expect(doc.start_screen).toBe('customers');
 expect(doc.screen_order).toEqual(['customers']);
 expect(doc.screens.map((s:any)=>s.id)).toEqual(['customers']);
 await expect(page.getByRole('button',{name:'Delete screen Customers'})).toBeDisabled();
});
test('screen delete confirmation can cancel without modifying design',async({page})=>{
 page.once('dialog',dialog=>dialog.dismiss());
 await page.getByRole('button',{name:'Delete screen Customers'}).click();
 await expect(page.getByRole('button',{name:'Delete screen Customers'})).toBeVisible();
 await expect(page.locator('.canvas .prototype-button')).toContainText(['Open customers']);
});

test('Phase 6 import preflight warns and needs explicit approval before replacing design',async({page})=>{
 let inspectCount=0,saveCount=0;
 await page.route('**/api/scraft/inspect',async route=>{
   inspectCount++;
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
     valid:true,compatible:true,name:'Imported Design',format_version:'1.2.0',
     screen_count:3,asset_count:1,warnings:['x-custom preserved as inactive placeholder']})});
 });
 await page.route('**/api/projects/p1/upload',async route=>{
   saveCount++;
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({revision:2,warnings:[]})});
 });
 await page.getByLabel('Choose .scraft file').setInputFiles({name:'sample.scraft',mimeType:'application/zip',buffer:Buffer.from('zip-stub')});
 const panel=page.getByRole('region',{name:'Import validation results'});
 await expect(panel).toContainText('Imported Design');
 await expect(panel).toContainText('x-custom preserved');
 expect(inspectCount).toBe(1);
 expect(saveCount).toBe(0);
 await page.getByRole('button',{name:'Cancel import'}).click();
 await expect(panel).toHaveCount(0);
 expect(saveCount).toBe(0);
 await page.getByLabel('Choose .scraft file').setInputFiles({name:'sample.scraft',mimeType:'application/zip',buffer:Buffer.from('zip-stub')});
 await page.getByRole('button',{name:'Import validated design'}).click();
 await expect.poll(()=>saveCount).toBe(1);
});
test('Phase 6 invalid ZIP shows error and cannot be approved',async({page})=>{
 await page.route('**/api/scraft/inspect',route=>route.fulfill({
   status:400,contentType:'application/json',body:JSON.stringify({error:'Invalid screen order'})}));
 await page.getByLabel('Choose .scraft file').setInputFiles({name:'bad.scraft',mimeType:'application/zip',buffer:Buffer.from('bad')});
 await expect(page.locator('.status')).toContainText('Invalid screen order');
 await expect(page.getByRole('button',{name:'Import validated design'})).toHaveCount(0);
});

test('Phase 9 editable grid previews selection, inline editing and row insertion',async({page})=>{
 await page.locator('[data-catalogue-type="x-editable-grid"]').click();
 await expect(page.locator('.canvas .data-grid')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Table / grid behaviour'})).toBeVisible();
 await expect(page.getByLabel('Table dataset')).not.toHaveValue('');
 await page.getByRole('button',{name:'▶ Preview'}).click();
 const grid=page.locator('.canvas .data-grid');
 await grid.getByRole('button',{name:'+ Row'}).click();
 await expect(grid.locator('tbody tr')).toHaveCount(2);
 await grid.getByRole('textbox',{name:'Edit row 2 Name'}).fill('Zephyr Ltd');
 await grid.getByRole('checkbox',{name:'Select row 1'}).check();
 await grid.getByRole('button',{name:'Delete selected'}).click();
 await expect(grid.locator('tbody tr')).toHaveCount(1);
 await expect(grid.locator('tbody')).toContainText('Zephyr Ltd');
});
test('Phase 9 sortable table filters records and saves configuration',async({page})=>{
 await page.locator('[data-catalogue-type="table"]').click();
 await page.getByLabel('Filter column').selectOption('Status');
 await page.getByLabel('Filter contains').fill('Active');
 await page.getByLabel('Page size').fill('10');
 const saved=page.waitForRequest(req=>req.url().endsWith('/api/projects/p1')&&req.method()==='PUT');
 await page.getByRole('button',{name:'Save',exact:true}).click();
 const doc=(await saved).postDataJSON().document;
 const table=doc.screens[0].nodes.find((n:any)=>n.type==='table');
 expect(table.props.filter_column).toBe('Status');
 expect(table.props.filter_value).toBe('Active');
 expect(table.props.page_size).toBe(10);
 await page.getByRole('button',{name:'▶ Preview'}).click();
 const grid=page.locator('.canvas .data-grid');
 await expect(grid.locator('tbody tr')).toHaveCount(1);
 await grid.getByRole('textbox',{name:'Search records'}).fill('absent');
 await expect(grid.locator('tbody tr')).toHaveCount(0);
 await expect(grid).toContainText('No matching records');
});
