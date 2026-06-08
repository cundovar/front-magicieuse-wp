import { useCallback, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { WpBlock } from '../../api/wordpress'
import ProductCard from '../../../features/shop/ProductCard'
import ProductList from '../../../features/shop/ProductList'
import WpHtmlBlock from './WpHtmlBlock'
import './WpBlocks.scss'

type BlockComponentProps = {
  block: WpBlock
}

type BlockMap = Record<string, ComponentType<BlockComponentProps>>

type Props = {
  block: WpBlock
  blockMap?: BlockMap
}

const slugCollection = import.meta.env.VITE_SLUG_COLLECTION || 'collections'
const slugProduct = import.meta.env.VITE_SLUG_PRODUCT || 'produit'

function blockHtml(block: WpBlock) {
  return block.renderedHTML || block.innerHTML || ''
}

function attrString(block: WpBlock, key: string) {
  const value = block.attrs[key]

  return typeof value === 'string' ? value : ''
}

function attrNumber(block: WpBlock, key: string, fallback: number) {
  const value = block.attrs[key]

  return typeof value === 'number' ? value : fallback
}

function parseRows(value: string) {
  return value
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split('|').map((part) => part.trim()))
}

// Lit un attribut tableau — nouveau format (array) ou legacy (pipe-string)
function attrItems<T extends Record<string, string>>(
  block: WpBlock,
  key: string,
  legacyMapper: (cols: string[]) => T,
): T[] {
  const raw = block.attrs[key]
  if (Array.isArray(raw)) return raw as T[]
  return parseRows(typeof raw === 'string' ? raw : '').map(legacyMapper)
}

function getVideoEmbedUrl(url: string) {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    const youtubeId =
      parsed.hostname.includes('youtu.be')
        ? parsed.pathname.replace('/', '')
        : parsed.searchParams.get('v')

    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}`
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : url
    }
  } catch {
    return url
  }

  return url
}

function isVideoFileUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

function HeadingBlock({ block }: BlockComponentProps) {
  return (
    <div
      className="wp-react-block wp-react-block--heading"
      dangerouslySetInnerHTML={{ __html: blockHtml(block) }}
    />
  )
}

function ParagraphBlock({ block }: BlockComponentProps) {
  return (
    <div
      className="wp-react-block wp-react-block--paragraph"
      dangerouslySetInnerHTML={{ __html: blockHtml(block) }}
    />
  )
}

function ImageBlock({ block }: BlockComponentProps) {
  const image = block.data?.image

  if (!image) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <figure className="wp-react-block wp-react-block--image">
      <img
        src={image.url}
        width={image.width}
        height={image.height}
        srcSet={image.srcset || undefined}
        sizes={image.sizes || undefined}
        alt={image.alt}
      />
      {image.caption && (
        <figcaption className="wp-react-block__caption">{image.caption}</figcaption>
      )}
    </figure>
  )
}

function ButtonLink({
  button,
}: {
  button: NonNullable<NonNullable<WpBlock['data']>['button']>
}) {
  return (
    <a
      className={`btn-primary wp-react-block__button${button.className ? ` ${button.className}` : ''}`}
      href={button.url}
      target={button.target ?? undefined}
      rel={button.rel ?? (button.target === '_blank' ? 'noopener noreferrer' : undefined)}
    >
      {button.label}
    </a>
  )
}

function ButtonBlock({ block }: BlockComponentProps) {
  const button = block.data?.button

  if (!button) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <div className="wp-react-block wp-react-block--buttons">
      <ButtonLink button={button} />
    </div>
  )
}

function ButtonsBlock({ block }: BlockComponentProps) {
  const buttons = block.data?.buttons

  if (buttons && buttons.length > 0) {
    return (
      <div className="wp-react-block wp-react-block--buttons">
        {buttons.map((button) => (
          <ButtonLink key={`${button.url}-${button.label}`} button={button} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="wp-react-block wp-react-block--buttons"
      dangerouslySetInnerHTML={{ __html: blockHtml(block) }}
    />
  )
}

function ProductsBlock({ block }: BlockComponentProps) {
  const products = block.data?.products ?? []
  const title = attrString(block, 'title')

  if (products.length === 0) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <section className="wp-react-block wp-react-block--products">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      <ProductList products={products} />
    </section>
  )
}

function HeroBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const subtitle = attrString(block, 'subtitle')
  const text = attrString(block, 'text')
  const primaryButtonLabel = attrString(block, 'primaryButtonLabel')
  const primaryButtonUrl = attrString(block, 'primaryButtonUrl')
  const secondaryButtonLabel = attrString(block, 'secondaryButtonLabel')
  const secondaryButtonUrl = attrString(block, 'secondaryButtonUrl')
  const image = block.data?.image

  return (
    <section className="wp-react-block wp-react-block--hero">
      <div className="wp-react-block__body">
        {subtitle && <p className="wp-react-block__eyebrow">{subtitle}</p>}
        {title && <h2 className="wp-react-block__hero-title">{title}</h2>}
        {text && <p className="wp-react-block__text">{text}</p>}
        {(primaryButtonLabel || secondaryButtonLabel) && (
          <div className="wp-react-block__actions">
            {primaryButtonLabel && primaryButtonUrl && (
              <a className="btn-primary" href={primaryButtonUrl}>
                {primaryButtonLabel}
              </a>
            )}
            {secondaryButtonLabel && secondaryButtonUrl && (
              <a className="wp-react-block__link" href={secondaryButtonUrl}>
                {secondaryButtonLabel}
              </a>
            )}
          </div>
        )}
      </div>
      {image && (
        <img
          className="wp-react-block__media"
          src={image.url}
          width={image.width}
          height={image.height}
          srcSet={image.srcset || undefined}
          sizes={image.sizes || undefined}
          alt={image.alt}
        />
      )}
    </section>
  )
}

function CtaBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const text = attrString(block, 'text')
  const buttonLabel = attrString(block, 'buttonLabel')
  const buttonUrl = attrString(block, 'buttonUrl')
  const variant = attrString(block, 'variant') || 'default'

  return (
    <section className={`wp-react-block wp-react-block--cta wp-react-block--cta-${variant}`}>
      <div>
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        {text && <p className="wp-react-block__text">{text}</p>}
      </div>
      {buttonLabel && buttonUrl && (
        <a className="btn-primary" href={buttonUrl}>
          {buttonLabel}
        </a>
      )}
    </section>
  )
}

function BookCarouselBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const category = attrString(block, 'category')
  const count = attrNumber(block, 'count', 8)
  const products = block.data?.products ?? []
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })
  const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="wp-react-block wp-react-block--book-carousel">
      <div className="wp-react-block__carousel-header">
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        {products.length > 1 && (
          <div className="wp-react-block__carousel-controls" aria-label="Navigation du carrousel">
            <button type="button" onClick={scrollPrevious} aria-label="Livres precedents">
              ‹
            </button>
            <button type="button" onClick={scrollNext} aria-label="Livres suivants">
              ›
            </button>
          </div>
        )}
      </div>
      {products.length > 0 ? (
        <div className="wp-react-block__book-carousel" ref={emblaRef}>
          <ul className="wp-react-block__book-track">
            {products.map((product) => (
              <li key={product.id} className="wp-react-block__book-slide">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="wp-react-block__meta">
          Carrousel de livres React - categorie : {category || 'toutes'} - {count} livre(s)
        </p>
      )}
    </section>
  )
}

function ImageTextBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const text = attrString(block, 'text')
  const imagePosition = attrString(block, 'imagePosition') || 'left'
  const buttonLabel = attrString(block, 'buttonLabel')
  const buttonUrl = attrString(block, 'buttonUrl')
  const image = block.data?.image

  return (
    <section
      className={`wp-react-block wp-react-block--image-text wp-react-block--image-${imagePosition}`}
    >
      {image && (
        <img
          className="wp-react-block__media"
          src={image.url}
          width={image.width}
          height={image.height}
          srcSet={image.srcset || undefined}
          sizes={image.sizes || undefined}
          alt={image.alt}
        />
      )}
      <div className="wp-react-block__body">
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        {text && <p className="wp-react-block__text">{text}</p>}
        {buttonLabel && buttonUrl && (
          <a className="btn-primary" href={buttonUrl}>
            {buttonLabel}
          </a>
        )}
      </div>
    </section>
  )
}

function FaqBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const items = attrItems(block, 'items', ([question, answer]) => ({ question, answer }))
    .filter((item) => item.question && item.answer)

  return (
    <section className="wp-react-block wp-react-block--faq">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      <div className="wp-react-block__faq-list">
        {items.map((item) => (
          <details key={item.question} className="wp-react-block__faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function GalleryBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const layout = attrString(block, 'layout') || 'grid'
  const images = block.data?.images ?? []
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const slides = images.map((image) => ({
    src: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt,
    description: image.caption,
  }))

  return (
    <section className={`wp-react-block wp-react-block--gallery wp-react-block--gallery-${layout}`}>
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      {images.length > 0 ? (
        <>
          <div className="wp-react-block__gallery-grid">
          {images.map((image, index) => (
            <figure key={image.id} className="wp-react-block__gallery-item">
              <button type="button" onClick={() => setLightboxIndex(index)}>
                <img
                  src={image.url}
                  width={image.width}
                  height={image.height}
                  srcSet={image.srcset || undefined}
                  sizes={image.sizes || undefined}
                  alt={image.alt}
                />
              </button>
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ))}
          </div>
          <Lightbox
            open={lightboxIndex >= 0}
            close={() => setLightboxIndex(-1)}
            index={lightboxIndex}
            slides={slides}
          />
        </>
      ) : (
        <WpHtmlBlock html={blockHtml(block)} />
      )}
    </section>
  )
}

function TestimonialsBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const layout = attrString(block, 'layout') || 'grid'
  const items = attrItems(block, 'items', ([quote, author, role]) => ({ quote, author, role }))
    .filter((item) => item.quote)

  return (
    <section className={`wp-react-block wp-react-block--testimonials wp-react-block--testimonials-${layout}`}>
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      <div className="wp-react-block__testimonial-list">
        {items.map((item) => (
          <figure key={`${item.quote}-${item.author}`} className="wp-react-block__testimonial">
            <blockquote>{item.quote}</blockquote>
            {(item.author || item.role) && (
              <figcaption>
                {item.author && <strong>{item.author}</strong>}
                {item.role && <span>{item.role}</span>}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}

function CategoryGridBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const categories = block.data?.categories ?? []

  return (
    <section className="wp-react-block wp-react-block--category-grid">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      <div className="wp-react-block__category-list">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/${slugCollection}/${category.slug}/`}
            className="wp-react-block__category-card"
          >
            {category.image && (
              <img
                src={category.image.url}
                width={category.image.width}
                height={category.image.height}
                alt={category.image.alt || category.name}
              />
            )}
            <span>{category.name}</span>
            <small>{category.count} produit(s)</small>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductHighlightBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const text = attrString(block, 'text')
  const buttonLabel = attrString(block, 'buttonLabel') || 'Voir le produit'
  const product = block.data?.product

  if (!product) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <section className="wp-react-block wp-react-block--product-highlight">
      <div className="wp-react-block__body">
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        {text && <p className="wp-react-block__text">{text}</p>}
        <Link className="btn-primary" to={`/${slugProduct}/${product.slug}/`}>
          {buttonLabel}
        </Link>
      </div>
      <ProductCard product={product} />
    </section>
  )
}

function NewsletterBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const text = attrString(block, 'text')
  const placeholder = attrString(block, 'placeholder') || 'Votre email'
  const buttonLabel = attrString(block, 'buttonLabel') || 'S’inscrire'
  const actionUrl = attrString(block, 'actionUrl')

  return (
    <section className="wp-react-block wp-react-block--newsletter">
      <div>
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        {text && <p className="wp-react-block__text">{text}</p>}
      </div>
      <form className="wp-react-block__newsletter-form" action={actionUrl || undefined} method="post">
        <input type="email" name="email" placeholder={placeholder} required />
        <button className="btn-primary" type="submit">
          {buttonLabel}
        </button>
      </form>
    </section>
  )
}

function AccordionBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const items = attrItems(block, 'items', ([itemTitle, text]) => ({ title: itemTitle, text }))
    .filter((item) => item.title && item.text)

  return (
    <section className="wp-react-block wp-react-block--accordion">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      <div className="wp-react-block__accordion-list">
        {items.map((item) => (
          <details key={item.title} className="wp-react-block__accordion-item">
            <summary>{item.title}</summary>
            <p>{item.text}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function TabsBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const items = attrItems(block, 'items', ([label, text]) => ({ label, text }))
    .filter((item) => item.label && item.text)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = items[activeIndex] ?? items[0]

  return (
    <section className="wp-react-block wp-react-block--tabs">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      <div className="wp-react-block__tab-list" role="tablist">
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {activeItem && (
        <div className="wp-react-block__tab-panel" role="tabpanel">
          <p>{activeItem.text}</p>
        </div>
      )}
    </section>
  )
}

function SliderBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')

  // Nouveau format (array d'objets enrichis par PHP) ou legacy (pipe-string)
  const slides = block.data?.slides
    ? block.data.slides.filter((s) => s.title || s.text || s.image)
    : parseRows(attrString(block, 'slides'))
        .map(([slideTitle, text, imageUrl, buttonLabel, buttonUrl]) => ({
          title: slideTitle,
          text,
          image: null,
          imageUrl,
          buttonLabel,
          buttonUrl,
        }))
        .filter((s) => s.title || s.text || s.imageUrl)

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: slides.length > 1 })
  const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="wp-react-block wp-react-block--slider">
      <div className="wp-react-block__carousel-header">
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        {slides.length > 1 && (
          <div className="wp-react-block__carousel-controls" aria-label="Navigation du slider">
            <button type="button" onClick={scrollPrevious} aria-label="Slide precedente">‹</button>
            <button type="button" onClick={scrollNext} aria-label="Slide suivante">›</button>
          </div>
        )}
      </div>
      <div className="wp-react-block__slider-viewport" ref={emblaRef}>
        <div className="wp-react-block__slider-track">
          {slides.map((slide, index) => {
            const imgSrc = slide.image?.url ?? ('imageUrl' in slide ? (slide as { imageUrl?: string }).imageUrl : undefined)
            return (
              <article key={index} className="wp-react-block__slide">
                {imgSrc && (
                  <img
                    src={imgSrc}
                    width={slide.image?.width}
                    height={slide.image?.height}
                    alt={slide.image?.alt ?? ''}
                  />
                )}
                <div>
                  {slide.title && <h3>{slide.title}</h3>}
                  {slide.text && <p>{slide.text}</p>}
                  {slide.buttonLabel && slide.buttonUrl && (
                    <a className="btn-primary" href={slide.buttonUrl}>{slide.buttonLabel}</a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function VideoEmbedBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const text = attrString(block, 'text')
  const url = attrString(block, 'url')
  const embedUrl = getVideoEmbedUrl(url)
  const isVideoFile = isVideoFileUrl(url)

  return (
    <section className="wp-react-block wp-react-block--video">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      {text && <p className="wp-react-block__text">{text}</p>}
      {isVideoFile ? (
        <video className="wp-react-block__video-file" src={url} controls playsInline />
      ) : embedUrl ? (
        <div className="wp-react-block__video-frame">
          <iframe src={embedUrl} title={title || 'Video'} allowFullScreen loading="lazy" />
        </div>
      ) : null}
    </section>
  )
}

function StepsBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const items = attrItems(block, 'items', ([stepTitle, text]) => ({ title: stepTitle, text }))
    .filter((item) => item.title || item.text)

  return (
    <section className="wp-react-block wp-react-block--steps">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      <ol className="wp-react-block__steps-list">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <span>{index + 1}</span>
            <div>
              {item.title && <h3>{item.title}</h3>}
              {item.text && <p>{item.text}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

const defaultBlockMap: BlockMap = {
  'core/heading': HeadingBlock,
  'core/paragraph': ParagraphBlock,
  'core/image': ImageBlock,
  'core/button': ButtonBlock,
  'core/buttons': ButtonsBlock,
  'woocommerce/product-collection': ProductsBlock,
  'woocommerce/handpicked-products': ProductsBlock,
  'woocommerce/products-by-category': ProductsBlock,
  'magicieuse/hero': HeroBlock,
  'magicieuse/cta': CtaBlock,
  'magicieuse/featured-products': ProductsBlock,
  'magicieuse/book-carousel': BookCarouselBlock,
  'magicieuse/image-text': ImageTextBlock,
  'magicieuse/faq': FaqBlock,
  'magicieuse/gallery': GalleryBlock,
  'magicieuse/testimonials': TestimonialsBlock,
  'magicieuse/category-grid': CategoryGridBlock,
  'magicieuse/product-highlight': ProductHighlightBlock,
  'magicieuse/newsletter': NewsletterBlock,
  'magicieuse/accordion': AccordionBlock,
  'magicieuse/tabs': TabsBlock,
  'magicieuse/slider': SliderBlock,
  'magicieuse/video-embed': VideoEmbedBlock,
  'magicieuse/steps': StepsBlock,
}

export default function BlockRenderer({ block, blockMap = defaultBlockMap }: Props) {
  const Component = block.blockName ? blockMap[block.blockName] : undefined

  if (!Component) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return <Component block={block} />
}
