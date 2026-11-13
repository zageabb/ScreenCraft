import type {Action,Node} from './model';

const INPUTS=new Set(['input','select','checkbox','x-date','x-number','x-textarea','x-time','x-radio','x-toggle','x-file-upload','x-search']);
function defaultValue(node:Node):unknown{
 if(node.type==='checkbox')return false;
 if(node.type==='select'){
  const option=node.props.options?.[0];
  return typeof option==='string'?option:option?.value??option?.label??'';
 }
 return node.props.value??'';
}

/** Prototype-only validation before a button writes a mock dataset. */
export function validateBoundInputs(action:Action,nodes:Node[],inputValues:Record<string,unknown>):string[]{
 const errors:string[]=[];
 for(const [column,id] of Object.entries(action.field_bindings||{})){
  if(!id)continue;
  const source=nodes.find(n=>n.id===id&&INPUTS.has(n.type));
  if(!source)continue;
  const props=source.props||{};
  const label=String(props.label||props.placeholder||column);
  const value=inputValues[id]??defaultValue(source);
  const string=String(value??'');
  if(props.required&&(['checkbox','x-toggle'].includes(source.type)?value!==true:!string.trim())){
   errors.push(label+' is required');continue;
  }
  if(!string.trim()&&source.type!=='checkbox')continue;
  if((source.type==='input'||source.type==='x-textarea')&&
     Number.isInteger(Number(props.min_length))&&props.min_length!==undefined&&
     string.length<Number(props.min_length))errors.push(label+' needs at least '+props.min_length+' characters');
  if((source.type==='input'||source.type==='x-textarea')&&
     Number.isInteger(Number(props.max_length))&&props.max_length!==undefined&&
     string.length>Number(props.max_length))errors.push(label+' cannot exceed '+props.max_length+' characters');
  if(source.type==='x-number'){
   const number=Number(string);
   if(!Number.isFinite(number)){errors.push(label+' must be a number');continue}
   if(props.min!==undefined&&props.min!==''&&number<Number(props.min))errors.push(label+' must be at least '+props.min);
   if(props.max!==undefined&&props.max!==''&&number>Number(props.max))errors.push(label+' cannot exceed '+props.max);
  }
  if(['x-date','x-time'].includes(source.type)&&/^\d{4}-\d\d-\d\d$/.test(string)){
   if(props.min&&string<String(props.min))errors.push(label+' cannot be before '+props.min);
   if(props.max&&string>String(props.max))errors.push(label+' cannot be after '+props.max);
  }
 }
 return errors;
}
