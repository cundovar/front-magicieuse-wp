import type { WooImage } from '../../api/woocommerce'
import SmartImage from '../SmartImage/SmartImage'

type Props = {
  images: WooImage[]
  name: string
  className?: string
  priority?: boolean
  preferThumbnail?: boolean
  sizes?: string
}

export default function ProductImage({
  images,
  name,
  className,
  priority = false,
  preferThumbnail = true,
  sizes,
}: Props) {
  const image = images[0]

  if (!image?.src) {
    return <div className={className} aria-hidden="true" role="presentation" />
  }

  const useThumbnail = preferThumbnail && Boolean(image.thumbnail)
  const src = useThumbnail ? image.thumbnail : image.src
  const srcSet = useThumbnail ? image.thumbnail_srcset : image.srcset
  const imageSizes = sizes ?? (useThumbnail
    ? '(max-width: 560px) 50vw, (max-width: 1100px) 33vw, 240px'
    : '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw')
  const width = useThumbnail ? image.thumbnail_width : image.width
  const height = useThumbnail ? image.thumbnail_height : image.height

  return (
    <SmartImage
      className={className}
      src={src}
      srcSet={srcSet || undefined}
      sizes={imageSizes}
      alt={image.alt || name}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  )
}
