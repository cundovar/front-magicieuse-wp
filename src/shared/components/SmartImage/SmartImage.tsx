import { useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes } from 'react'
import './SmartImage.scss'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}

export default function SmartImage({
  className,
  wrapperClassName,
  wrapperStyle,
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [canReveal, setCanReveal] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const classes = [
    'smart-image',
    className,
    wrapperClassName,
    status === 'loaded' && canReveal ? 'smart-image--loaded' : '',
    status === 'error' ? 'smart-image--error' : '',
  ].filter(Boolean).join(' ')
  const width = typeof props.width === 'number' ? props.width : Number(props.width)
  const height = typeof props.height === 'number' ? props.height : Number(props.height)
  const aspectRatio = width > 0 && height > 0 ? `${width} / ${height}` : undefined

  useEffect(() => {
    const timer = window.setTimeout(() => setCanReveal(true), 320)
    return () => window.clearTimeout(timer)
  }, [])

  // Si l'image est déjà en cache navigateur, onLoad se déclenche avant que React
  // attache son handler. On vérifie img.complete au montage pour rattraper ce cas.
  useEffect(() => {
    if (imgRef.current?.complete) {
      setStatus(imgRef.current.naturalWidth > 0 ? 'loaded' : 'error')
    }
  }, [])

  return (
    <span className={classes} style={{ aspectRatio, ...wrapperStyle }}>
      {status === 'error' && (
        <span className="smart-image__loader" aria-hidden="true">
          <span className="smart-image__picture-mark">
            <span className="smart-image__picture-sun" />
            <span className="smart-image__picture-mountain smart-image__picture-mountain--back" />
            <span className="smart-image__picture-mountain" />
          </span>
        </span>
      )}
      <img
        {...props}
        ref={imgRef}
        className="smart-image__img"
        loading={loading}
        decoding={decoding}
        onLoad={(event) => {
          setStatus('loaded')
          onLoad?.(event)
        }}
        onError={(event) => {
          setStatus('error')
          onError?.(event)
        }}
      />
    </span>
  )
}
