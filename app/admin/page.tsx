import { getChatGPTUser,chatGPTSignInPath } from '../chatgpt-auth';
import { isAdmin } from '@/lib/booking';
import AdminPanel from './panel';
export const dynamic='force-dynamic';
export const metadata={title:'Agenda da Luiza | Lua Lash'};
export default async function Admin(){
 const user=await getChatGPTUser();
 if(!user)return <main className="admin-gate"><img src="/logo-lua-lash.jpg" alt="Lua Lash"/><h1>Agenda da Luiza</h1><p>Entre com a conta autorizada para visualizar e organizar os agendamentos.</p><a className="hero-cta" href={chatGPTSignInPath('/admin')} target="_top">Entrar na agenda</a><a href="/">Voltar ao site</a></main>;
 if(!(await isAdmin()))return <main className="admin-gate"><h1>Acesso restrito</h1><p>O e-mail {user.email} ainda não está autorizado a administrar esta agenda.</p><a href="/">Voltar ao site</a></main>;
 return <AdminPanel email={user.email}/>;
}
