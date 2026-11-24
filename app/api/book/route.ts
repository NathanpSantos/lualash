import { available,dateInRange,fail,getSettings,getServiceById,recentBookings,reserve } from '@/lib/booking';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
 let body:Record<string,unknown>;
 try{body=await request.json()}catch{return fail('Dados inválidos.');}
 if(body.website)return fail('Não foi possível enviar a reserva.');
 const date=String(body.date||''),start=Number(body.minute),serviceId=String(body.serviceId||'base-extension'),name=String(body.name||'').trim(),phone=String(body.phone||'').replace(/\D/g,''),mode=String(body.mode||''),neighborhood=String(body.neighborhood||'').trim();
 if(!dateInRange(date)||!Number.isInteger(start)||start%30||!['espaco','domicilio'].includes(mode))return fail('Escolha uma data, horário e local válidos.');
 if(name.length<2||name.length>80||phone.length<10||phone.length>13||neighborhood.length>80)return fail('Confira seu nome, telefone e bairro.');
 const hourAgo=new Date(Date.now()-60*60*1000).toISOString();
 if((await recentBookings(phone,hourAgo))>=3)return fail('Você já enviou pedidos recentemente. Converse com a Luiza para ajustar.',429);
 const {hours}=await getSettings();const service=await getServiceById(serviceId);if(!service)return fail('Procedimento indisponível.',404);
 if(!(await available(date,service.duration,hours)).includes(start))return fail('Esse horário acabou de ficar indisponível. Escolha outro.',409);
 const id=crypto.randomUUID(),created=new Date().toISOString();
 try {
  await reserve({id,date,startMinute:start,endMinute:start+service.duration,serviceName:service.name,mode,customerName:name,phone,neighborhood:neighborhood||null,status:'pending',createdAt:created});
 } catch {return fail('Esse horário acabou de ficar indisponível. Escolha outro.',409);}
 return Response.json({id:id.slice(0,8).toUpperCase(),status:'pending',date,minute:start,service:service.name},{status:201,headers:{'Cache-Control':'no-store'}});
}
