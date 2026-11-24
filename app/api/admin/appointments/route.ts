import { blocks,dateInRange,db,fail,getSettings,isAdmin,validDate } from '@/lib/booking';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 if(!(await isAdmin()))return fail('Acesso restrito.',403);
 const from=new URL(request.url).searchParams.get('from')||'';
 if(!validDate(from))return fail('Data inválida.');
 const rows=await db().prepare('SELECT * FROM appointments WHERE date>=? ORDER BY date,start_minute LIMIT 300').bind(from).all();
 return Response.json({appointments:rows.results,settings:await getSettings()},{headers:{'Cache-Control':'no-store'}});
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
  try{await db().batch([
    db().prepare('INSERT INTO appointments(id,date,start_minute,end_minute,service_name,mode,status,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(id,date,start,start+duration,'Horário bloqueado','—','blocked',new Date().toISOString()),
    ...blocks(date,start,duration,id)
   ]);}catch{return fail('Horário já ocupado.',409);}
  return Response.json({ok:true});
 }
 const id=String(body.id||''),status=String(body.status||'');
 if(!id||!['confirmed','cancelled','completed','pending'].includes(status))return fail('Ação inválida.');
 const current=await db().prepare('SELECT status FROM appointments WHERE id=?').bind(id).first<{status:string}>();
 if(!current)return fail('Agendamento não encontrado.',404);
 if(status==='cancelled') {
  await db().batch([db().prepare('UPDATE appointments SET status=? WHERE id=?').bind(status,id),db().prepare('DELETE FROM occupied_blocks WHERE appointment_id=?').bind(id)]);
 }else if(current.status==='cancelled')return fail('Um horário cancelado não pode ser reaberto. Crie uma nova reserva.');
 else if(current.status==='blocked')return fail('Desbloqueie esse horário usando Cancelar.');
 else await db().prepare('UPDATE appointments SET status=? WHERE id=?').bind(status,id).run();
 return Response.json({ok:true});
}
