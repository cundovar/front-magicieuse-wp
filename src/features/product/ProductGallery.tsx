import { useState } from 'react'
import type { WooImage } from '../../shared/api/woocommerce'
import SmartImage from '../../shared/components/SmartImage/SmartImage'

type Props = {
  images: WooImage[]
  name: string
  className?: string
}

export default function ProductGallery({ images, name, className }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const image = images[activeIndex] ?? images[0]

  if (!image?.src) {
    return <div className={className} aria-hidden="true" role="presentation" />
  }

  return (
    <div className={`product-gallery${className ? ` ${className}` : ''}`}>
      <SmartImage
        className="product-gallery__main"
        src={image.src}
        srcSet={image.srcset || undefined}
        sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw"
        alt={image.alt || name}
        width={image.width}
        height={image.height}
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      {images.length > 1 && (
        <div className="product-gallery__thumbnails" role="list" aria-label="Galerie produit">
          {images.map((thumb, index) => (
            <button
              key={`${thumb.id}-${index}`}
              type="button"
              className={`product-gallery__thumb${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Afficher l’image ${index + 1} de ${images.length}`}
              aria-pressed={index === activeIndex}
            >
              <SmartImage
                src={thumb.thumbnail || thumb.src}
                srcSet={thumb.thumbnail_srcset || undefined}
                sizes="120px"
                alt=""
                width={thumb.thumbnail_width}
                height={thumb.thumbnail_height}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
