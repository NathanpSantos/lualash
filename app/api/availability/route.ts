import { available,dateInRange,fail,getSettings,getServiceById,time } from '@/lib/booking';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 const params=new URL(request.url).searchParams;const date=params.get('date')||'';
 const requestedService=params.get('service')||'base-extension';
 if(!dateInRange(date))return fail('Escolha uma data nos próximos 45 dias.');
 const {hours}=await getSettings();const service=await getServiceById(requestedService);if(!service)return fail('Procedimento indisponível.',404);
 const slots=await available(date,service.duration,hours);
 return Response.json({date,service,hours,slots:slots.map(x=>({minute:x,label:time(x)}))},{headers:{'Cache-Control':'no-store'}});
}
