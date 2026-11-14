import React,{useState} from 'react';
import {tokenLabels} from './palettePresets';

type ColourProperty='background_color'|'color'|'border_color';
const properties:Record<ColourProperty,string>={
 background_color:'Background',color:'Text / foreground',border_color:'Border'
};
const validHex=/^#[0-9a-fA-F]{6}$/;

export default function ObjectColourEditor({styleValue,tokens,theme,canEdit,onChange}:{
 styleValue:Record<string,string>;tokens:Record<string,string>;theme:string;canEdit:boolean;
 onChange:(style:Record<string,string>)=>void;
}){
 const [property,setProperty]=useState<ColourProperty>('background_color');
 const token=styleValue[property+'_token'];
 const fixed=styleValue[property];
 const resolved=(token&&tokens[token])||fixed||'#FFFFFF';
 const hex=validHex.test(resolved)?resolved:'#FFFFFF';
 const mode=token?'palette':fixed?'custom':'inherit';
 function selectToken(nextToken:string){
  const next={...styleValue,[property+'_token']:nextToken};
  delete next[property];onChange(next);
 }
 function setFixed(nextValue:string){
  if(!validHex.test(nextValue))return;
  const next={...styleValue,[property]:nextValue.toUpperCase()};
  delete next[property+'_token'];onChange(next);
 }
 function reset(){
  const next={...styleValue};delete next[property];delete next[property+'_token'];onChange(next);
 }
 return <section className="object-colour-editor" aria-label="Object appearance">
  <h3>Appearance · {theme}</h3>
  <label>Colour property<select aria-label="Object colour property" value={property} onChange={e=>setProperty(e.target.value as ColourProperty)}>
   {Object.entries(properties).map(([key,label])=><option key={key} value={key}>{label}</option>)}
  </select></label>
  <div className="object-colour-current">
   <span className="object-colour-chip" style={{backgroundColor:hex}} aria-hidden="true"/>
   <span>{mode==='palette'?('Palette · '+(tokenLabels[token]||token)):mode==='custom'?('Fixed · '+fixed):'Inherited / default'}</span>
  </div>
  <div className="object-colour-swatches" role="group" aria-label="Application palette colours">
   {Object.entries(tokens).filter(([,value])=>validHex.test(value)).map(([key,value])=>
    <button type="button" key={key} className="object-colour-swatch"
     disabled={!canEdit} aria-label={'Use '+(tokenLabels[key]||key)+' for '+properties[property]}
     aria-pressed={mode==='palette'&&token===key} title={(tokenLabels[key]||key)+' ('+value+')'}
     style={{backgroundColor:value}} onClick={()=>selectToken(key)}>
      {mode==='palette'&&token===key?<span aria-hidden="true" className="object-colour-selected">✓</span>:null}
    </button>)}
  </div>
  <div className="object-colour-actions">
   <button type="button" disabled={!canEdit||mode==='inherit'} onClick={reset}>Use default</button>
   <label>Custom HEX<input aria-label={'Custom '+properties[property]+' colour'} type="color"
     value={hex} disabled={!canEdit} onChange={e=>setFixed(e.target.value)}/></label>
  </div>
  <label>Fixed HEX override<input aria-label={'Fixed '+properties[property]+' HEX'} key={property+':'+(fixed||'')}
   maxLength={7} defaultValue={fixed||hex} disabled={!canEdit}
   onBlur={e=>{if(validHex.test(e.target.value)){if(e.target.value.toUpperCase()!==fixed?.toUpperCase()||mode!=='custom')setFixed(e.target.value)}
    else e.target.value=fixed||hex}}
   onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape'){e.currentTarget.value=fixed||hex;e.currentTarget.blur()}}}/></label>
  <p className="muted">Palette swatches follow light/dark themes. A fixed HEX override keeps the same colour in both themes.</p>
 </section>;
}
