import type { Metadata } from 'next'
import '@/styles/tailwind.css'
import '@/styles/main.scss'
import '@/styles/wp-content.scss'
import '@/themes/theme-magicieuse.scss'
import '@/themes/theme-magicieuse-clair.scss'
import '@/themes/theme-field-folio.scss'
import '@/themes/clients/magicieuse-wp.scss'
import Header from '@/shared/components/Header/Header'
import Footer from '@/shared/components/Footer/Footer'
import BottomNav from '@/shared/components/BottomNav/BottomNav'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from './providers'
import { SITE_URL, SITE_NAME, organizationJsonLd } from '@/shared/seo'

const defaultDescription =
  'Albums jeunesse, collections sensibles et univers d’artistes pour les petits lecteurs curieux.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Maison d’édition jeunesse`,
    // Les pages fournissent déjà leur titre complet « … — La Magicieuse ».
    template: '%s',
  },
  description: defaultDescription,
  authors: [{ name: 'Facundo Varas', url: 'https://github.com/cundovar' }],
  creator: 'Facundo Varas',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'fr_FR',
    title: `${SITE_NAME} — Maison d’édition jeunesse`,
    description: defaultDescription,
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Maison d’édition jeunesse`,
    description: defaultDescription,
    images: ['/og-image.png'],
  },
}

// Pose data-theme avant hydratation pour éviter le flash de thème (remplace ThemeLoader).
const THEME_INIT = `(function(){try{var t=localStorage.getItem('magicieuse_theme')||'magicieuse';document.documentElement.dataset.theme=t;}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="author" href="/humans.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
          <BottomNav />
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
