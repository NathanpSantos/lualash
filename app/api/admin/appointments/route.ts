import { asc, eq, gte } from 'drizzle-orm';
import { db } from '@/db';
import { appointments, occupiedBlocks } from '@/db/schema';
import { dateInRange,fail,getSettings,isAdmin,reserve,validDate } from '@/lib/booking';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 if(!(await isAdmin()))return fail('Acesso restrito.',403);
 const from=new URL(request.url).searchParams.get('from')||'';
 if(!validDate(from))return fail('Data inválida.');
 const rows=await db.select().from(appointments).where(gte(appointments.date,from)).orderBy(asc(appointments.date),asc(appointments.startMinute)).limit(300);
 const list=rows.map(r=>({id:r.id,date:r.date,start_minute:r.startMinute,end_minute:r.endMinute,service_name:r.serviceName,mode:r.mode,customer_name:r.customerName,phone:r.phone,neighborhood:r.neighborhood,status:r.status,created_at:r.createdAt}));
 return Response.json({appointments:list,settings:await getSettings()},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request) {
 if(!(await isAdmin()))return fail('Acesso restrito.',403);
 let body:Record<string,unknown>;try{body=await request.json()}catch{return fail('Dados inválidos.');}
 if(body.action==='block') {
  const date=String(body.date||''),start=Number(body.minute),duration=Number(body.duration||120);
  if(!dateInRange(date)||!Number.isInteger(start)||start%30||!Number.isInteger(duration)||duration<30||duration>360||duration%30)return fail('Horário inválido.');
  const {hours}=await getSettings(),day=hours[new Date(date+'T12:00:00Z').getUTCDay()];
  if(!day?.open||start<day.start||start+duration>day.end)return fail('Horário fora do expediente.');
  const id=crypto.randomUUID();
  try{await reserve({id,date,startMinute:start,endMinute:start+duration,serviceName:'Horário bloqueado',mode:'—',status:'blocked',createdAt:new Date().toISOString()});}catch{return fail('Horário já ocupado.',409);}
  return Response.json({ok:true});
 }
 const id=String(body.id||''),status=String(body.status||'');
 if(!id||!['confirmed','cancelled','completed','pending'].includes(status))return fail('Ação inválida.');
 const [current]=await db.select({status:appointments.status}).from(appointments).where(eq(appointments.id,id));
 if(!current)return fail('Agendamento não encontrado.',404);
 if(status==='cancelled') {
  await db.transaction(async tx=>{
   await tx.update(appointments).set({status}).where(eq(appointments.id,id));
   await tx.delete(occupiedBlocks).where(eq(occupiedBlocks.appointmentId,id));
  });
 }else if(current.status==='cancelled')return fail('Um horário cancelado não pode ser reaberto. Crie uma nova reserva.');
 else if(current.status==='blocked')return fail('Desbloqueie esse horário usando Cancelar.');
 else await db.update(appointments).set({status}).where(eq(appointments.id,id));
 return Response.json({ok:true});
}
