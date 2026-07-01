import { getFront } from '@/shared/api/wordpress'
import HomePage from '@/features/home/HomePage'
import { SwrFallback } from './swr-fallback'

export const revalidate = 3600

export default async function Page() {
  const front = await getFront()
  return (
    <SwrFallback entries={[['front', front]]}>
      <HomePage />
    </SwrFallback>
  )
}
