import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

function offlineHtml():string{
 const script=`
from screencraft.package import starter_app
from screencraft.export import interactive_html
doc=starter_app()
doc["datasets"]=[{"id":"sales","columns":[{"id":"Category","type":"text"},{"id":"Amount","type":"number"}],
"rows":[{"Category":"A","Amount":10},{"Category":"A","Amount":20},{"Category":"B","Amount":5}],
"persistence":"seed-reset"}]
doc["screens"][0]["nodes"]=[
 {"id":"kpi","type":"x-kpi","parent_id":None,"props":{"label":"Total sales","dataset_id":"sales","aggregation":"sum","value_column":"Amount"},"layout":{"x":10,"y":10,"width":220,"height":100}},
 {"id":"bar","type":"x-chart","parent_id":None,"props":{"label":"Sales bar","dataset_id":"sales","chart_type":"bar","aggregation":"sum","category_column":"Category","value_column":"Amount"},"layout":{"x":10,"y":120,"width":440,"height":240}},
 {"id":"line","type":"x-chart","parent_id":None,"props":{"label":"Sales line","dataset_id":"sales","chart_type":"line","aggregation":"sum","category_column":"Category","value_column":"Amount"},"layout":{"x":470,"y":120,"width":440,"height":240}},
 {"id":"pie","type":"x-chart","parent_id":None,"props":{"label":"Sales pie","dataset_id":"sales","chart_type":"pie","aggregation":"sum","category_column":"Category","value_column":"Amount"},"layout":{"x":10,"y":380,"width":440,"height":240}},
 {"id":"add","type":"button","parent_id":None,"props":{"label":"Add sale"},"layout":{"x":470,"y":380,"width":160,"height":45},"action":{"type":"add_mock_row","dataset_id":"sales","values":{"Category":"B","Amount":15}}}
]
print(interactive_html(doc))
`;
 return execFileSync('python3',['-c',script],{env:{...process.env,PYTHONPATH:resolve(process.cwd(),'../backend')},encoding:'utf8'});
}
test('actual standalone HTML renders dataset KPI, bar, line and pie and updates values after action',async({page})=>{
 const requests:string[]=[];
 page.on('request',r=>requests.push(r.url()));
 await page.setContent(offlineHtml(),{waitUntil:'load'});
 await expect(page.locator('[data-node-id="kpi"]')).toContainText('35');
 await expect(page.locator('[data-node-id="bar"] svg rect')).toHaveCount(2);
 await expect(page.locator('[data-node-id="line"] svg polyline')).toHaveCount(1);
 await expect(page.locator('[data-node-id="pie"] svg path')).toHaveCount(2);
 await expect(page.locator('[data-node-id="bar"] .sc-chart-legend')).toContainText('A: 30');
 await expect(page.locator('[data-node-id="bar"] .sc-chart-legend')).toContainText('B: 5');
 await page.locator('[data-node-id="add"]').click();
 await expect(page.locator('[data-node-id="kpi"]')).toContainText('50');
 await expect(page.locator('[data-node-id="bar"] .sc-chart-legend')).toContainText('B: 20');
 expect(requests).toEqual([]);
});
