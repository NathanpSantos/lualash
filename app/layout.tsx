import type { ReactNode } from 'react';
import './globals.css';
import { AuthRedirect } from './admin/auth';
export default function RootLayout({children}:{children:ReactNode}){return <html lang="pt-BR"><body><AuthRedirect/>{children}</body></html>}
