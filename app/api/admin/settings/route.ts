import { db,fail,isAdmin } from '@/lib/booking';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
 if(!(await isAdmin()))return fail('Acesso restrito.',403);
 let body:Record<string,unknown>;try{body=await request.json()}catch{return fail('Dados inválidos.');}
 const hours=body.hours as {open?:unknown;start?:unknown;end?:unknown}[]|undefined;
 if(!Array.isArray(hours)||hours.length!==7||!hours.every(h=>typeof h.open==='boolean'&&Number.isInteger(h.start)&&Number.isInteger(h.end)&&Number(h.start)%30===0&&Number(h.end)%30===0&&Number(h.start)>=0&&Number(h.end)<=1440&&Number(h.end)>Number(h.start)))return fail('Confira os horários de atendimento.');
 await db().prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('hours',JSON.stringify(hours)).run();
 return Response.json({ok:true});
}
