import type {Action,Node} from './model';

/** Resolve configured static defaults and explicit field bindings at click time. */
export function resolveActionRow(action:Action, nodes:Node[], inputValues:Record<string,unknown>):Record<string,unknown>{
 const values:Record<string,unknown>={...(action.values||{})};
 for(const [column,id] of Object.entries(action.field_bindings||{})){
   if(!id)continue;
   const source=nodes.find(node=>node.id===id);
   if(!source||!['input','select','checkbox','x-date','x-number','x-textarea','x-time','x-radio','x-toggle','x-file-upload','x-search'].includes(source.type))continue;
   values[column]=inputValues[id]??(['checkbox','x-toggle'].includes(source.type)?false:source.type==='select'?(source.props?.options?.[0]??''):source.props?.value??'');
 }
 return values;
}
