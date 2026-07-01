import type { Metadata } from 'next'
import { getFront } from '@/shared/api/wordpress'
import HomePage from '@/features/home/HomePage'
import { SITE_NAME } from '@/shared/seo'
import { SwrFallback } from './swr-fallback'

export const revalidate = 3600

export const metadata: Metadata = {
  title: `${SITE_NAME} — Albums & collections jeunesse`,
  description:
    'Maison d’édition jeunesse indépendante : albums, collections sensibles et univers d’artistes pour les petits lecteurs curieux.',
  alternates: { canonical: '/' },
}

export default async function Page() {
  const front = await getFront()
  return (
    <SwrFallback entries={[['front', front]]}>
      <HomePage />
    </SwrFallback>
  )
}
