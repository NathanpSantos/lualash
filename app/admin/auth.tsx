'use client';
import { useEffect, useState } from 'react';
import { acceptInvite, AuthError, handleAuthCallback, login, logout, MissingIdentityError, requestPasswordRecovery, updateUser } from '@netlify/identity';

const reload = () => { window.location.href = '/admin'; };
const message = (e: unknown) => {
  if (e instanceof MissingIdentityError) return 'O login ainda não está disponível neste site.';
  if (e instanceof AuthError) return e.status === 401 || e.status === 400 ? 'E-mail ou senha incorretos.' : e.message;
  return 'Não foi possível entrar. Tente novamente.';
};

/** Sends Identity email links (invite, recovery, confirmation) that land on the home page to the admin login. */
export function AuthRedirect() {
  useEffect(() => {
    if (/(invite|recovery|confirmation|email_change)_token=|access_token=/.test(window.location.hash) && window.location.pathname !== '/admin') {
      window.location.replace('/admin' + window.location.hash);
    }
  }, []);
  return null;
}

export function AdminLogin() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'invite' | 'recovery' | 'forgot'>('login');
  const [inviteToken, setInviteToken] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [info, setInfo] = useState('');

  useEffect(() => {
    handleAuthCallback().then(result => {
      if (!result) return;
      if (result.type === 'invite' && result.token) { setInviteToken(result.token); setMode('invite'); }
      else if (result.type === 'recovery') setMode('recovery');
      else reload();
    }).catch(e => setError(message(e)));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setInfo('');
    try {
      if (mode === 'login') { await login(email, password); reload(); }
      else if (mode === 'invite') { await acceptInvite(inviteToken, password); reload(); }
      else if (mode === 'recovery') { await updateUser({ password }); reload(); }
      else { await requestPasswordRecovery(email); setInfo('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.'); }
    } catch (err) { setError(message(err)); } finally { setBusy(false); }
  }

  const needsEmail = mode === 'login' || mode === 'forgot', needsPassword = mode !== 'forgot';
  return <form onSubmit={submit} style={{ display: 'grid', gap: 12, width: '100%', textAlign: 'left' }}>
    {mode === 'invite' && <p>Crie uma senha para acessar a agenda.</p>}
    {mode === 'recovery' && <p>Defina sua nova senha.</p>}
    {needsEmail && <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 700 }}>E-mail<input className="date-input" style={{ maxWidth: 'none' }} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>}
    {needsPassword && <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 700 }}>{mode === 'login' ? 'Senha' : 'Nova senha'}<input className="date-input" style={{ maxWidth: 'none' }} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? undefined : 8} value={password} onChange={e => setPassword(e.target.value)} /></label>}
    <button className="submit" style={{ marginTop: 4 }} disabled={busy}>{busy ? 'Aguarde…' : mode === 'login' ? 'Entrar na agenda' : mode === 'forgot' ? 'Enviar link' : 'Salvar senha'}</button>
    {mode === 'login' && <button type="button" className="text-button" style={{ marginTop: 0 }} onClick={() => { setMode('forgot'); setError(''); }}>Esqueci minha senha</button>}
    {mode === 'forgot' && <button type="button" className="text-button" style={{ marginTop: 0 }} onClick={() => { setMode('login'); setInfo(''); }}>Voltar ao login</button>}
    {error && <p className="error" role="alert">{error}</p>}
    {info && <p className="saved">{info}</p>}
  </form>;
}

export function LogoutButton() {
  return <button type="button" className="text-button" style={{ marginTop: 0 }} onClick={async () => { try { await logout(); } finally { reload(); } }}>Sair</button>;
}
