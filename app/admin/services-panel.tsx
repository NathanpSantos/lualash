'use client';
import {useEffect,useState} from 'react';
type Service={id:string;category:string;name:string;description:string;duration:number;priceCents:number|null;active:boolean;sortOrder:number};
const blank:Service={id:'',category:'Extensão de cílios',name:'',description:'',duration:120,priceCents:null,active:true,sortOrder:0};
const money=(c:number|null)=>c===null?'Valor sob consulta':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(c/100);
export default function ServicesPanel(){
 const [services,setServices]=useState<Service[]>([]),[edit,setEdit]=useState<Service|null>(null),[price,setPrice]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState('');
 async function load(){const r=await fetch('/api/admin/services',{cache:'no-store'});const j:any=await r.json();if(!r.ok)throw Error(j.error||'Erro ao carregar serviços.');setServices(j.services)}
 useEffect(()=>{load().catch(e=>setError(e.message))},[]);
 function begin(s:Service){setEdit({...s});setPrice(s.priceCents===null?'':String(s.priceCents/100).replace('.',','));setError('');setSaved('')}
 async function save(s:Service){setBusy(true);setError('');setSaved('');try{
  const normalized=price.trim().replace(',','.');const cents=normalized===''?null:Math.round(Number(normalized)*100);
  if(s===edit&&normalized!==''&&(cents===null||!Number.isFinite(cents)||cents<0))throw Error('Valor inválido.');
  const r=await fetch('/api/admin/services',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...s,priceCents:s===edit?cents:s.priceCents})});const j:any=await r.json();if(!r.ok)throw Error(j.error||'Não foi possível salvar.');await load();setEdit(null);setSaved('Catálogo atualizado.');
 }catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar.')}finally{setBusy(false)}}
 return <section className="settings-card"><h2>Catálogo de procedimentos</h2><p>Cadastre somente as técnicas que a Luiza realmente oferece. Duração e preço aparecem para a cliente; deixe o valor vazio para informar na conversa.</p>{error&&<p className="error" role="alert">{error}</p>}{saved&&<p className="saved" role="status">{saved}</p>}
 <div className="service-admin-list">{services.map(s=><article className="service-admin-card" key={s.id}><h3>{s.name} {!s.active&&<span className="badge cancelled">Oculto</span>}</h3><p>{s.category} · {s.duration} min · {money(s.priceCents)}</p><button type="button" onClick={()=>begin(s)}>Editar</button><button type="button" disabled={busy} onClick={()=>save({...s,active:!s.active})}>{s.active?'Ocultar':'Reativar'}</button></article>)}</div>
 {!edit?<button className="submit" onClick={()=>begin({...blank})}>Adicionar procedimento</button>:<div className="service-form"><label>Nome do procedimento<input value={edit.name} maxLength={80} onChange={e=>setEdit({...edit,name:e.target.value})}/></label><label>Categoria<input value={edit.category} maxLength={50} onChange={e=>setEdit({...edit,category:e.target.value})}/></label><label className="wide">Descrição<textarea value={edit.description} maxLength={400} onChange={e=>setEdit({...edit,description:e.target.value})}/></label><label>Duração em minutos<select value={edit.duration} onChange={e=>setEdit({...edit,duration:Number(e.target.value)})}>{[30,60,90,120,150,180,210,240,270,300,330,360].map(x=><option key={x} value={x}>{x} minutos</option>)}</select></label><label>Valor em reais (opcional)<input inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Ex.: 120,00"/></label><div className="service-form-actions"><button className="primary-action" disabled={busy} onClick={()=>save(edit)}>Salvar serviço</button><button onClick={()=>setEdit(null)}>Cancelar</button></div></div>}
 </section>
}
