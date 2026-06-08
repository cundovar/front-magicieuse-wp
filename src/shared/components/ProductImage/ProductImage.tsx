import type { WooImage } from '../../api/woocommerce'

type Props = {
  images: WooImage[]
  name: string
  className?: string
}

export default function ProductImage({ images, name, className }: Props) {
  const image = images[0]

  if (!image?.src) {
    return <div className={className} aria-hidden="true" role="presentation" />
  }

  return (
    <img
      className={className}
      src={image.src}
      srcSet={image.srcset || undefined}
      sizes={image.sizes || undefined}
      alt={image.alt || name}
      loading="lazy"
    />
  )
}
