import {db,fail,getServices,isAdmin} from '@/lib/booking';
export const dynamic='force-dynamic';
export async function GET(){if(!(await isAdmin()))return fail('Acesso restrito.',403);return Response.json({services:await getServices(true)},{headers:{'Cache-Control':'no-store'}})}
export async function POST(request:Request){
 if(!(await isAdmin()))return fail('Acesso restrito.',403);
 let b:Record<string,unknown>;try{b=await request.json()}catch{return fail('Dados inválidos.');}
 const id=typeof b.id==='string'&&b.id.length<80?b.id:crypto.randomUUID();
 const name=String(b.name||'').trim(),category=String(b.category||'').trim(),description=String(b.description||'').trim();
 const duration=Number(b.duration),price=b.priceCents===null||b.priceCents===''?null:Number(b.priceCents),active=b.active!==false;
 if(name.length<3||name.length>80||category.length<3||category.length>50||description.length>400||!Number.isInteger(duration)||duration<30||duration>360||duration%30!==0||price!==null&&(!Number.isInteger(price)||price<0||price>1000000))return fail('Confira nome, categoria, duração e valor.');
 const exists=await db().prepare('SELECT id FROM services WHERE id=?').bind(id).first();
 if(!exists&&id!=='base-extension'&&b.id)return fail('Procedimento inválido.',404);
 if(exists)await db().prepare('UPDATE services SET category=?,name=?,description=?,duration_minutes=?,price_cents=?,active=? WHERE id=?').bind(category,name,description,duration,price,active?1:0,id).run();
 else await db().prepare('INSERT INTO services(id,category,name,description,duration_minutes,price_cents,active,sort_order,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,category,name,description,duration,price,active?1:0,0,new Date().toISOString()).run();
 return Response.json({ok:true,id});
}
