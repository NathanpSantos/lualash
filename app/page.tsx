import type { Metadata } from 'next';
import Booking from './booking';

const siteUrl = 'https://lualash.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Extensão de cílios em Guarulhos | Lua Lash',
  description: 'Conheça os procedimentos da Lua Lash e solicite seu horário online com a Luiza em Guarulhos. Atendimento no espaço dela ou em domicílio, sujeito à confirmação.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Lua Lash',
    title: 'Lua Lash | Extensão de cílios em Guarulhos',
    description: 'Veja os procedimentos e escolha seu horário online com a Luiza.',
    images: [{ url: '/logo-lua-lash.jpg', width: 469, height: 469, alt: 'Logo Lua Lash' }],
  },
  twitter: { card: 'summary', images: ['/logo-lua-lash.jpg'] },
};

const business = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'Lua Lash',
  description: 'Extensão de cílios com agendamento online em Guarulhos.',
  url: siteUrl,
  image: `${siteUrl}/logo-lua-lash.jpg`,
  telephone: '+55 11 92001-6687',
  areaServed: { '@type': 'City', name: 'Guarulhos' },
  sameAs: ['https://www.instagram.com/luaa_lashh/'],
};

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
    <Booking />
  </>;
}
