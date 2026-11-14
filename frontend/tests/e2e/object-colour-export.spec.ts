import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function paletteExport():string{
 const script=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
app=starter_app()
app['themes']={
 'light':{'tokens':{'surface.page':'#FFFFFF','surface.default':'#FFFFFF','text.primary':'#222222','action.primary':'#2563EB','action.on_primary':'#FFFFFF'}},
 'dark':{'tokens':{'surface.page':'#111111','surface.default':'#292929','text.primary':'#FFFFFF','action.primary':'#E23B55','action.on_primary':'#111111'}}
}
app['default_theme']='light'
app['screens'][0]['nodes']=[
 {'id':'linked','type':'button','parent_id':None,'props':{'label':'Linked'},'layout':{'x':20,'y':20,'width':140,'height':44},
  'style':{'background_color_token':'action.primary','color_token':'action.on_primary'}},
 {'id':'fixed','type':'text','parent_id':None,'props':{'text':'Fixed'},'layout':{'x':20,'y':80,'width':140,'height':44},
  'style':{'background_color':'#AA1122','color':'#FFFFFF'}}
]
print(interactive_html(app))
`;
 return execFileSync('python3',['-c',script],{
  env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},
  encoding:'utf8',maxBuffer:10*1024*1024
 });
}

test('standalone interactive HTML preserves per-object token links and fixed colours',async({page})=>{
 const requests:string[]=[];
 page.on('request',req=>requests.push(req.url()));
 await page.setContent(paletteExport(),{waitUntil:'load'});
 const linked=page.locator('[data-node-id="linked"]');
 const fixed=page.locator('[data-node-id="fixed"]');
 await expect(linked).toHaveCSS('background-color','rgb(37, 99, 235)');
 await expect(linked).toHaveCSS('color','rgb(255, 255, 255)');
 await expect(fixed).toHaveCSS('background-color','rgb(170, 17, 34)');
 await page.getByRole('combobox',{name:'Application theme'}).selectOption('dark');
 await expect(linked).toHaveCSS('background-color','rgb(226, 59, 85)');
 await expect(linked).toHaveCSS('color','rgb(17, 17, 17)');
 await expect(fixed).toHaveCSS('background-color','rgb(170, 17, 34)');
 expect(requests).toEqual([]);
});
