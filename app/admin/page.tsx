import { getUser } from '@netlify/identity';
import { isAdmin } from '@/lib/booking';
import AdminPanel from './panel';
import { AdminLogin, LogoutButton } from './auth';
export const dynamic='force-dynamic';
export const metadata={title:'Agenda da Luiza | Lua Lash'};
export default async function Admin(){
 const user=await getUser();
 if(!user?.email)return <main className="admin-gate"><img src="/logo-lua-lash.jpg" alt="Lua Lash"/><h1>Agenda da Luiza</h1><p>Entre com a conta autorizada para visualizar e organizar os agendamentos.</p><AdminLogin/><a href="/">Voltar ao site</a></main>;
 if(!(await isAdmin()))return <main className="admin-gate"><h1>Acesso restrito</h1><p>O e-mail {user.email} ainda não está autorizado a administrar esta agenda.</p><LogoutButton/><a href="/">Voltar ao site</a></main>;
 return <AdminPanel email={user.email}/>;
}
