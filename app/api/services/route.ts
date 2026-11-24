import {getServices} from '@/lib/booking';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({services:await getServices()},{headers:{'Cache-Control':'no-store'}})}
