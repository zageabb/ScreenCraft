import type {Dataset,Document,Node} from './model';

/** Every table has a dedicated editable sample dataset, independent from action JSON. */
export function withTableDataset(doc:Document,node:Node):{document:Document;node:Node}{
 if(node.type!=='table')return {document:doc,node};
 const id='dataset-'+node.id;
 const dataset:Dataset={
   id,
   columns:[{id:'Name',type:'text'},{id:'Status',type:'text'}],
   rows:[{Name:'Example record',Status:'Active'}],
   persistence:'seed-reset'
 };
 return {document:{...doc,datasets:[...doc.datasets,dataset]},
   node:{...node,props:{...node.props,dataset_id:id}}};
}
export function updateDataset(doc:Document,updated:Dataset):Document{
 return {...doc,datasets:doc.datasets.map(d=>d.id===updated.id?updated:d)};
}
