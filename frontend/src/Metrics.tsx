import React from 'react';
export type MetricProps={dataset_id?:string;label?:string;value?:string;aggregation?:string;value_column?:string;category_column?:string;chart_type?:string};
export function aggregate(rows:Record<string,any>[],op:string,column:string):number{
 if(op==='count')return rows.length;
 const values=rows.map(r=>Number(r[column])).filter(Number.isFinite);
 if(!values.length)return 0;
 if(op==='sum')return values.reduce((a,b)=>a+b,0);
 if(op==='average')return values.reduce((a,b)=>a+b,0)/values.length;
 if(op==='min')return Math.min(...values);
 if(op==='max')return Math.max(...values);
 return 0;
}
export function chartData(rows:Record<string,any>[],category:string,column:string,op:string){
 const buckets=new Map<string,Record<string,any>[]>();
 for(const row of rows){
  const key=String(row[category]??'(blank)');
  if(!buckets.has(key))buckets.set(key,[]);
  buckets.get(key)!.push(row);
 }
 return Array.from(buckets,([name,group])=>({name,value:aggregate(group,op,column)})).slice(0,30);
}
export function metricFormat(value:number){return Number.isFinite(value)?new Intl.NumberFormat('en-GB',{maximumFractionDigits:2}).format(value):'0'}
const palette=['#2765be','#24a494','#e2a23c','#9562bc','#dc736c','#537b8c','#83af4c'];
export function MetricCard({props,rows}: {props:MetricProps;rows:Record<string,any>[]}){
 const number=props.dataset_id?metricFormat(aggregate(rows,props.aggregation||'count',props.value_column||'')):String(props.value??'0');
 return <div className="kpi-tile" data-metric-kind="kpi"><small>{props.label||'KPI'}</small><strong>{number}</strong>{props.dataset_id&&<small>{props.aggregation||'count'}</small>}</div>;
}
export function DataChart({props,rows}: {props:MetricProps;rows:Record<string,any>[]}){
 const type=['bar','line','pie'].includes(props.chart_type||'')?props.chart_type:'bar';
 const data=chartData(rows,props.category_column||'',props.value_column||'',props.aggregation||'count');
 const max=Math.max(1,...data.map(d=>Math.abs(d.value)));
 const total=data.reduce((s,d)=>s+Math.max(0,d.value),0);
 let cumulative=0;
 return <div className="sc-chart" data-chart-type={type} role="img" aria-label={(props.label||'Chart')+' '+type+' chart'}>
  <strong>{props.label||'Chart'}</strong>
  {!props.dataset_id?<p>No dataset selected</p>:!data.length?<p>No chart data</p>:<>
   <svg viewBox="0 0 480 220" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    {type==='bar'&&data.map((d,i)=>{const w=440/data.length, h=Math.abs(d.value)/max*155;return <rect key={d.name} x={20+i*w+w*.16} y={175-h} width={w*.67} height={h} fill={palette[i%palette.length]}/>})}
    {type==='line'&&<polyline fill="none" stroke={palette[0]} strokeWidth="3" points={data.map((d,i)=>`${20+i*440/Math.max(1,data.length-1)},${175-(d.value/max*155)}`).join(' ')}/>}
    {type==='line'&&data.map((d,i)=><circle key={d.name} cx={20+i*440/Math.max(1,data.length-1)} cy={175-d.value/max*155} r="4" fill={palette[0]}/>)}
    {type==='pie'&&data.map((d,i)=>{const fraction=total?Math.max(0,d.value)/total:0;const r=74,cx=240,cy=105;const start=cumulative; cumulative+=fraction;
      if(fraction===0)return null;
      if(fraction>=1)return <circle key={d.name} cx={cx} cy={cy} r={r} fill={palette[i%palette.length]}/>;
      const angle=(a:number)=>(a-.25)*2*Math.PI;
      const at=(a:number)=>[cx+r*Math.cos(angle(a)),cy+r*Math.sin(angle(a))];
      const p1=at(start),p2=at(cumulative);
      return <path key={d.name} d={`M ${cx} ${cy} L ${p1.join(' ')} A ${r} ${r} 0 ${fraction>.5?1:0} 1 ${p2.join(' ')} Z`} fill={palette[i%palette.length]}/>;
    })}
   </svg>
   <div className="sc-chart-legend">{data.map((d,i)=><span key={i}><i style={{background:palette[i%palette.length]}}/>{d.name}: {metricFormat(d.value)}</span>)}</div>
  </>}
 </div>;
}
