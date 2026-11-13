import type {Document} from './model';

// Theme definitions are pure data. The editor chrome never uses these tokens.
export type PalettePreset='screencraft'|'corporate'|'custom';
export const paletteNames:Record<PalettePreset,string>={
 screencraft:'ScreenCraft — Blue / Grey',
 corporate:'Corporate — Black / Grey / Red',
 custom:'Custom / imported'
};
export const tokenLabels:Record<string,string>={
 'surface.page':'Page background',
 'surface.default':'Card / panel surface',
 'surface.nav':'Navigation surface',
 'surface.input':'Input background',
 'surface.selected':'Selected row / menu',
 'text.primary':'Primary text',
 'text.secondary':'Secondary / placeholder',
 'text.disabled':'Disabled text',
 'border.default':'Borders',
 'action.primary':'Primary action',
 'action.on_primary':'Action text'
};
export const palettePresets:Record<Exclude<PalettePreset,'custom'>,Record<'light'|'dark',Record<string,string>>>={
 screencraft:{
  light:{'surface.page':'#F5F7FA','surface.default':'#FFFFFF','surface.nav':'#E9F1FC','surface.input':'#FFFFFF','surface.selected':'#DBEAFE','text.primary':'#172033','text.secondary':'#52647B','text.disabled':'#64748B','border.default':'#CBD5E1','action.primary':'#2563EB','action.on_primary':'#FFFFFF'},
  dark:{'surface.page':'#101827','surface.default':'#1E293B','surface.nav':'#0B1220','surface.input':'#1E293B','surface.selected':'#263F66','text.primary':'#F1F5F9','text.secondary':'#94A3B8','text.disabled':'#94A3B8','border.default':'#334155','action.primary':'#60A5FA','action.on_primary':'#0B1220'}
 },
 corporate:{
  light:{'surface.page':'#F5F5F5','surface.default':'#FFFFFF','surface.nav':'#E5E5E5','surface.input':'#FFFFFF','surface.selected':'#FBE7EA','text.primary':'#222222','text.secondary':'#555555','text.disabled':'#666666','border.default':'#B5B5B5','action.primary':'#B50926','action.on_primary':'#FFFFFF'},
  dark:{'surface.page':'#111111','surface.default':'#292929','surface.nav':'#171717','surface.input':'#292929','surface.selected':'#50212A','text.primary':'#F5F5F5','text.secondary':'#BBBBBB','text.disabled':'#B1B1B1','border.default':'#636363','action.primary':'#E23B55','action.on_primary':'#111111'}
 }
};
export function applyPalettePreset(doc:Document,preset:Exclude<PalettePreset,'custom'>):Document{
 // Merge so application-specific extension tokens survive a palette change.
 return {...doc,application_palette:{preset},themes:{
  ...doc.themes,
  light:{...doc.themes.light,tokens:{...(doc.themes.light?.tokens||{}),...palettePresets[preset].light}},
  dark:{...doc.themes.dark,tokens:{...(doc.themes.dark?.tokens||{}),...palettePresets[preset].dark}}
 }};
}
export function setThemeToken(doc:Document,theme:string,key:string,value:string):Document{
 if(!/^#[0-9a-fA-F]{6}$/.test(value))return doc;
 return {...doc,application_palette:{preset:'custom'},themes:{
  ...doc.themes,[theme]:{...doc.themes[theme],tokens:{...(doc.themes[theme]?.tokens||{}),[key]:value.toUpperCase()}}
 }};
}
