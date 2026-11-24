import { getUser } from '@netlify/identity';
import { and, asc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { appointments, occupiedBlocks, services, settings } from '@/db/schema';

export type Hours = { open: boolean; start: number; end: number }[];
export type Service = { id:string; category:string; name:string; description:string; duration:number; priceCents:number|null; active:boolean; sortOrder:number };
export const defaultHours: Hours = [
  {open:false,start:540,end:1080},
  {open:true,start:540,end:1080},
  {open:true,start:540,end:1080},
  {open:true,start:540,end:1080},
  {open:true,start:540,end:1080},
  {open:true,start:540,end:1080},
  {open:true,start:540,end:840},
];
export const defaultService: Service = { id:'base-extension', category:'Extensão de cílios', name:'Extensão de cílios', description:'Realce seu olhar com um atendimento personalizado. Consulte a técnica ideal com a Luiza.', duration:120, priceCents:null, active:true, sortOrder:0 };
export const fail = (message:string,status=400) => Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export const validDate = (s:string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T12:00:00Z')) && new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export const todaySP = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const nowSP = () => {
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 return Number(parts.find(x=>x.type==='hour')?.value)*60+Number(parts.find(x=>x.type==='minute')?.value);
};
export const dateInRange = (date:string) => {
 if (!validDate(date)) return false;
 const start=todaySP(); const end=new Date(start+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+45);
 return date>=start && date<=end.toISOString().slice(0,10);
};
export const weekday = (date:string) => new Date(date+'T12:00:00Z').getUTCDay();
export const time = (minute:number) => `${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
export async function getServices(includeInactive=false):Promise<Service[]> {
 const rows=await db.select().from(services).orderBy(asc(services.sortOrder),asc(services.name));
 const list:Service[]=rows.map(r=>({id:r.id,category:r.category,name:r.name,description:r.description,duration:r.durationMinutes,priceCents:r.priceCents,active:r.active,sortOrder:r.sortOrder}));
 if(!list.some(s=>s.id===defaultService.id)) {
  let legacy=defaultService;
  try {const [r]=await db.select({value:settings.value}).from(settings).where(eq(settings.key,'service'));if(r){const old=JSON.parse(r.value);legacy={...defaultService,name:old.name||defaultService.name,duration:old.duration||defaultService.duration};}}catch{}
  list.unshift(legacy);
 }
 return includeInactive?list:list.filter(s=>s.active);
}
export async function getServiceById(id:string):Promise<Service|null>{return (await getServices()).find(s=>s.id===id)||null;}
export async function getSettings() {
 const [r]=await db.select({value:settings.value}).from(settings).where(eq(settings.key,'hours'));
 let hours=defaultHours;
 try{if(r)hours=JSON.parse(r.value)}catch{}
 const service=(await getServices())[0]||defaultService;
 return {hours,service};
}
export async function available(date:string, duration:number, hours:Hours) {
 const rule=hours[weekday(date)]; if(!rule?.open)return [];
 const occupied=await db.select({minute:occupiedBlocks.minute}).from(occupiedBlocks).where(eq(occupiedBlocks.date,date));
 const busy=new Set(occupied.map(x=>x.minute));
 const slots:number[]=[];
 for(let start=rule.start;start+duration<=rule.end;start+=30) {
  if(date===todaySP() && start<=nowSP()+60)continue;
  let free=true;for(let m=start;m<start+duration;m+=30){if(busy.has(m)){free=false;break;}}
  if(free)slots.push(start);
 }
 return slots;
}
export async function isAdmin() {
 const user=await getUser();
 if(!user?.email)return false;
 if(user.roles?.includes('admin'))return true;
 const emails=(process.env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 return emails.includes(user.email.toLowerCase());
}
export const blockRows = (date:string,start:number,duration:number,id:string) => {
 const out:{date:string;minute:number;appointmentId:string}[]=[];
 for(let minute=start;minute<start+duration;minute+=30)out.push({date,minute,appointmentId:id});
 return out;
};
/** Inserts an appointment and reserves its 30-minute blocks atomically; throws if any block is already taken. */
export async function reserve(appointment:typeof appointments.$inferInsert) {
 await db.transaction(async tx=>{
  await tx.insert(appointments).values(appointment);
  await tx.insert(occupiedBlocks).values(blockRows(appointment.date,appointment.startMinute,appointment.endMinute-appointment.startMinute,appointment.id));
 });
}
export async function recentBookings(phone:string,since:string) {
 const [r]=await db.select({total:sql<number>`count(*)::int`}).from(appointments).where(and(eq(appointments.phone,phone),sql`${appointments.createdAt} > ${since}`));
 return r?.total||0;
}
