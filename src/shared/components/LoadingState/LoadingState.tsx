import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'
import './LoadingState.scss'

interface Props {
  message?: string;
}

export function LoadingState({ message = 'Chargement...' }: Props) {
  const containerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let animation: AnimationItem | null = null
    let cancelled = false

    import('lottie-web').then((lottieModule) => {
      if (cancelled || !containerRef.current) return
      animation = lottieModule.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: `${import.meta.env.BASE_URL}lottie/cat-loading.json`,
      })
    })

    return () => {
      cancelled = true
      animation?.destroy()
      animation = null
    }
  }, [])

  return (
    <div className="loading-state" role="status" aria-label={message}>
      <span ref={containerRef} className="loading-state__lottie" aria-hidden="true" />
      <p className="loading-state__label">{message}</p>
    </div>
  )
}
