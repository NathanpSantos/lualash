import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { services } from '@/db/schema';
import {fail,getServices,isAdmin} from '@/lib/booking';
export const dynamic='force-dynamic';
export async function GET(){if(!(await isAdmin()))return fail('Acesso restrito.',403);return Response.json({services:await getServices(true)},{headers:{'Cache-Control':'no-store'}})}
export async function POST(request:Request){
 if(!(await isAdmin()))return fail('Acesso restrito.',403);
 let b:Record<string,unknown>;try{b=await request.json()}catch{return fail('Dados inválidos.');}
 const id=typeof b.id==='string'&&b.id.length<80?b.id:crypto.randomUUID();
 const name=String(b.name||'').trim(),category=String(b.category||'').trim(),description=String(b.description||'').trim();
 const duration=Number(b.duration),price=b.priceCents===null||b.priceCents===''?null:Number(b.priceCents),active=b.active!==false;
 if(name.length<3||name.length>80||category.length<3||category.length>50||description.length>400||!Number.isInteger(duration)||duration<30||duration>360||duration%30!==0||price!==null&&(!Number.isInteger(price)||price<0||price>1000000))return fail('Confira nome, categoria, duração e valor.');
 const [exists]=await db.select({id:services.id}).from(services).where(eq(services.id,id));
 if(!exists&&id!=='base-extension'&&b.id)return fail('Procedimento inválido.',404);
 if(exists)await db.update(services).set({category,name,description,durationMinutes:duration,priceCents:price,active}).where(eq(services.id,id));
 else await db.insert(services).values({id,category,name,description,durationMinutes:duration,priceCents:price,active,sortOrder:0,createdAt:new Date().toISOString()});
 return Response.json({ok:true,id});
}
