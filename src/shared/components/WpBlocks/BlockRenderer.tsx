'use client'

import { useCallback, useEffect, useState, type ComponentType, type CSSProperties } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import useSWR from 'swr'
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircleQuestion,
  PackageCheck,
  Phone,
  Play,
  Sparkles,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import type { WpBlock } from '../../api/wordpress'
import { getInstagramFeed, getInstagramProxyImageUrl } from '../../api/wordpress'
import { addToCart } from '../../api/woocommerce'
import ProductList from '../../../features/shop/ProductList'
import { useCart } from '../../../features/cart/useCart'
import { decodeHtml } from '../../utils/html'
import { Button, ButtonLink, SmartButtonLink } from '../Button'
import { SmartLink } from '../SmartLink'
import SmartImage from '../SmartImage/SmartImage'
import ProductImage from '../ProductImage/ProductImage'
import ProductPrice from '../ProductPrice/ProductPrice'
import WpHtmlBlock from './WpHtmlBlock'
import RelatedProducts from '../../../features/product/RelatedProducts'
import ContactForm from '../../../features/contact/ContactForm'
import './WpBlocks.scss'

type BlockComponentProps = {
  block: WpBlock
}

type BlockMap = Record<string, ComponentType<BlockComponentProps>>

type Props = {
  block: WpBlock
  blockMap?: BlockMap
}

const slugCollection = process.env.NEXT_PUBLIC_SLUG_COLLECTION || 'collections'
const slugProduct = process.env.NEXT_PUBLIC_SLUG_PRODUCT || 'produit'
const slugShop = process.env.NEXT_PUBLIC_SLUG_SHOP || 'boutique'

function blockHtml(block: WpBlock) {
  return block.renderedHTML || block.innerHTML || ''
}

function attrString(block: WpBlock, key: string) {
  const value = block.attrs[key]

  return typeof value === 'string' ? value : ''
}

function firstAttrString(block: WpBlock, keys: string[]) {
  for (const key of keys) {
    const value = attrString(block, key).trim()
    if (value) return value
  }

  return ''
}

function attrNumber(block: WpBlock, key: string, fallback: number) {
  const value = block.attrs[key]

  return typeof value === 'number' ? value : fallback
}

function attrBoolean(block: WpBlock, key: string) {
  const value = block.attrs[key]

  return typeof value === 'boolean' ? value : false
}

function attrHasBoolean(block: WpBlock, key: string) {
  return typeof block.attrs[key] === 'boolean'
}

function blockClassName(baseClassName: string, block: WpBlock, extra: string[] = []) {
  const className = attrString(block, 'className')
  const align = attrString(block, 'align')
  const verticalAlignment = attrString(block, 'verticalAlignment')
  const classes = [baseClassName, ...extra]

  if (className) classes.push(className)
  if (align) classes.push(`align${align}`)
  if (verticalAlignment) classes.push(`is-vertically-aligned-${verticalAlignment}`)

  return classes.join(' ')
}

function parseRows(value: string) {
  return value
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split('|').map((part) => part.trim()))
}

function plainTextFromHtml(value: string) {
  return decodeHtml(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value

  const truncated = value.slice(0, maxLength).trimEnd()
  const lastSpace = truncated.lastIndexOf(' ')

  return `${(lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated).trimEnd()}...`
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
  const text = plainTextFromHtml(blockHtml(block))
  const reassuranceIcon = getReassuranceParagraphIcon(text)

  if (reassuranceIcon && attrString(block, 'className').includes('magicieuse-reassurance__icon')) {
    const Icon = reassuranceIcon

    return (
      <p className="wp-react-block wp-react-block--paragraph magicieuse-reassurance__icon">
        <Icon size={22} strokeWidth={2.4} aria-hidden="true" />
      </p>
    )
  }

  const contactIcon = getContactParagraphIcon(text)

  if (contactIcon) {
    const Icon = contactIcon.icon

    return (
      <p className="wp-react-block wp-react-block--paragraph wp-react-block--contact-line">
        <Icon size={18} aria-hidden="true" />
        <span>{contactIcon.text}</span>
      </p>
    )
  }

  return (
    <div
      className="wp-react-block wp-react-block--paragraph"
      dangerouslySetInnerHTML={{ __html: blockHtml(block) }}
    />
  )
}

function getReassuranceParagraphIcon(text: string): LucideIcon | null {
  const normalized = text.trim()

  if (normalized === '🔒') return LockKeyhole
  if (normalized === '↗') return Truck
  if (normalized === '✦') return Sparkles

  return null
}

function getContactParagraphIcon(text: string): { icon: LucideIcon; text: string } | null {
  const normalized = text.trim()
  const entries: Array<[RegExp, LucideIcon]> = [
    [/^📍\s*/, MapPin],
    [/^📞\s*/, Phone],
    [/^☎️?\s*/, Phone],
    [/^✉️?\s*/, Mail],
    [/^📧\s*/, Mail],
    [/^🕐\s*/, Clock],
    [/^🕘\s*/, Clock],
    [/^🕒\s*/, Clock],
  ]

  for (const [pattern, icon] of entries) {
    if (pattern.test(normalized)) {
      return { icon, text: normalized.replace(pattern, '') }
    }
  }

  return null
}

const reassuranceItems: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: LockKeyhole,
    title: 'Paiement sécurisé',
    text: 'Commande protégée via WooCommerce.',
  },
  {
    icon: Truck,
    title: 'Livraison suivie',
    text: 'Expédition avec suivi selon les options disponibles.',
  },
  {
    icon: Sparkles,
    title: 'Sélection choisie',
    text: 'Chaque produit est intégré avec soin à l’univers Magicieuse.',
  },
]

function ReassuranceBlock() {
  return (
    <div className="wp-react-block wp-react-block--group magicieuse-reassurance">
      <div className="wp-react-block wp-react-block--columns magicieuse-reassurance__columns is-stacked-on-mobile">
        {reassuranceItems.map(({ icon: Icon, title, text }) => (
          <div key={title} className="wp-react-block__column">
            <p className="wp-react-block wp-react-block--paragraph magicieuse-reassurance__icon">
              <Icon size={22} strokeWidth={2.4} aria-hidden="true" />
            </p>
            <h3 className="wp-react-block wp-react-block--heading">
              {title}
            </h3>
            <p className="wp-react-block wp-react-block--paragraph">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const deliverySteps: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: BookOpenCheck,
    title: 'Délais',
    text: 'Préparation selon disponibilité des produits et rythme d’expédition indiqué lors de la commande.',
  },
  {
    icon: PackageCheck,
    title: 'Suivi',
    text: 'Quand l’option le permet, un suivi accompagne l’envoi pour garder un œil sur le colis.',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Question',
    text: 'Un doute avant de commander ? Contacte-nous avant validation du panier.',
  },
]

function DeliveryBlock() {
  return (
    <section className="wp-react-block wp-react-block--group magicieuse-livraison-commande">
      <div className="wp-react-block wp-react-block--columns magicieuse-livraison-commande__cols is-stacked-on-mobile">
        <div className="wp-react-block__column magicieuse-livraison-commande__intro">
          <p className="magicieuse-livraison-commande__eyebrow">Commande</p>
          <h2>Livraison & suivi</h2>
          <p>
            Les commandes sont préparées avec soin. Les options disponibles
            s’affichent au moment de la validation du panier.
          </p>
          <SmartButtonLink className="magicieuse-livraison-commande__button" href="/contact/">
            Une question ? Contactez-nous
          </SmartButtonLink>
        </div>
        <div className="wp-react-block__column">
          <div className="magicieuse-livraison-commande__etapes">
            {deliverySteps.map(({ icon: Icon, title, text }) => (
              <article key={title} className="magicieuse-livraison-commande__etape">
                <span className="magicieuse-livraison-commande__pastille">
                  <Icon size={22} strokeWidth={2.35} aria-hidden="true" />
                </span>
                <div className="magicieuse-livraison-commande__card">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ImageBlock({ block }: BlockComponentProps) {
  const image = block.data?.image

  if (!image) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <figure className="wp-react-block wp-react-block--image">
      <SmartImage
        src={image.url}
        width={image.width}
        height={image.height}
        srcSet={image.srcset || undefined}
        sizes="(max-width: 760px) 100vw, 760px"
        alt={image.alt}
        loading="lazy"
        decoding="async"
      />
      {image.caption && (
        <figcaption className="wp-react-block__caption">{image.caption}</figcaption>
      )}
    </figure>
  )
}

function WpButtonLink({
  button,
}: {
  button: NonNullable<NonNullable<WpBlock['data']>['button']>
}) {
  return (
    <SmartButtonLink
      className={`wp-react-block__button${button.className ? ` ${button.className}` : ''}`}
      href={button.url}
      target={button.target ?? undefined}
      rel={button.rel ?? undefined}
    >
      {button.label}
    </SmartButtonLink>
  )
}

function ButtonBlock({ block }: BlockComponentProps) {
  const button = block.data?.button

  if (!button) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <div className="wp-react-block wp-react-block--buttons">
      <WpButtonLink button={button} />
    </div>
  )
}

function ButtonsBlock({ block }: BlockComponentProps) {
  const buttons = block.data?.buttons

  if (buttons && buttons.length > 0) {
    return (
      <div className="wp-react-block wp-react-block--buttons">
        {buttons.map((button) => (
          <WpButtonLink key={`${button.url}-${button.label}`} button={button} />
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
  const primaryButtonLabel = firstAttrString(block, [
    'primaryButtonLabel',
    'buttonLabel',
    'ctaLabel',
    'linkLabel',
  ])
  const primaryButtonUrl = firstAttrString(block, [
    'primaryButtonUrl',
    'buttonUrl',
    'ctaUrl',
    'linkUrl',
    'url',
  ])
  const secondaryButtonLabel = firstAttrString(block, [
    'secondaryButtonLabel',
    'secondaryLabel',
  ])
  const secondaryButtonUrl = firstAttrString(block, [
    'secondaryButtonUrl',
    'secondaryUrl',
  ])
  const primaryButton = block.data?.button
  const image = block.data?.image

  return (
    <section className="wp-react-block wp-react-block--hero">
      <div className="wp-react-block__body">
        {subtitle && <p className="wp-react-block__eyebrow">{subtitle}</p>}
        {title && <h1 className="wp-react-block__hero-title">{title}</h1>}
        {text && <p className="wp-react-block__text">{text}</p>}
        {((primaryButton?.label && primaryButton.url) || primaryButtonLabel || secondaryButtonLabel) && (
          <div className="wp-react-block__actions">
            {primaryButton?.label && primaryButton.url ? (
              <WpButtonLink button={primaryButton} />
            ) : primaryButtonLabel && primaryButtonUrl ? (
              <SmartButtonLink href={primaryButtonUrl}>
                {primaryButtonLabel}
              </SmartButtonLink>
            ) : null}
            {secondaryButtonLabel && secondaryButtonUrl && (
              <SmartLink className="wp-react-block__link" href={secondaryButtonUrl}>
                {secondaryButtonLabel}
              </SmartLink>
            )}
          </div>
        )}
      </div>
      {image && (
        <SmartImage
          className="wp-react-block__media"
          src={image.url}
          width={image.width}
          height={image.height}
          srcSet={image.srcset || undefined}
          sizes="(max-width: 900px) 100vw, 50vw"
          alt={image.alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
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
        <SmartButtonLink href={buttonUrl}>
          {buttonLabel}
        </SmartButtonLink>
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrevious = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollToSnap = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const sync = () => {
      setScrollSnaps(emblaApi.scrollSnapList())
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }
    sync()
    emblaApi.on('reInit', sync).on('select', sync)
    return () => { emblaApi.off('reInit', sync).off('select', sync) }
  }, [emblaApi])

  const chevronLeft = <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
  const chevronRight = <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />

  return (
    <section className="wp-react-block wp-react-block--book-carousel">
      <div className="wp-react-block__carousel-header">
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        <SmartLink className="wp-react-block__catalog-link" href={`/${slugShop}/`}>
          Tout le catalogue →
        </SmartLink>
      </div>
      {products.length > 0 ? (
        <div className="wp-react-block__book-carousel" ref={emblaRef}>
          <ul className="wp-react-block__book-track">
            {products.map((product) => {
                const description = truncateText(plainTextFromHtml(product.short_description), 140)
                return (
                  <li key={product.id} className="wp-react-block__book-slide">
                    <Link
                      href={`/${slugProduct}/${product.slug}/`}
                      className="wp-react-block__book-card"
                    >
                      <ProductImage
                        images={product.images}
                        name={product.name}
                        className="wp-react-block__book-image"
                      />
                      <span className="wp-react-block__book-overlay">
                        <strong>{decodeHtml(product.name)}</strong>
                        {description && <span>{description}</span>}
                      </span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </div>
      ) : (
        <p className="wp-react-block__meta">
          Carrousel de livres React - categorie : {category || 'toutes'} - {count} livre(s)
        </p>
      )}
      {products.length > 1 && (
        <div className="wp-react-block__carousel-controls">
          <button type="button" className="wp-react-block__carousel-btn" onClick={scrollPrevious} disabled={!canScrollPrev} aria-label="Livres précédents">
            {chevronLeft}
          </button>
          {scrollSnaps.length > 1 && (
            <span className="wp-react-block__carousel-dots" aria-hidden="true">
              {scrollSnaps.map((_, i) => (
                <i key={i} className={i === selectedIndex ? 'is-active' : ''} onClick={() => scrollToSnap(i)} />
              ))}
            </span>
          )}
          <button type="button" className="wp-react-block__carousel-btn" onClick={scrollNext} disabled={!canScrollNext} aria-label="Livres suivants">
            {chevronRight}
          </button>
        </div>
      )}
    </section>
  )
}

function ImageTextBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const text = attrString(block, 'text')
  const imagePosition = attrString(block, 'imagePosition') || 'left'
  const buttonLabel = firstAttrString(block, [
    'buttonLabel',
    'primaryButtonLabel',
    'ctaLabel',
    'linkLabel',
  ])
  const buttonUrl = firstAttrString(block, [
    'buttonUrl',
    'primaryButtonUrl',
    'ctaUrl',
    'linkUrl',
    'url',
  ])
  const button = block.data?.button
  const image = block.data?.image

  return (
    <section
      className={`wp-react-block wp-react-block--image-text wp-react-block--image-${imagePosition}`}
    >
      {image && (
        <SmartImage
          className="wp-react-block__media"
          src={image.url}
          width={image.width}
          height={image.height}
          srcSet={image.srcset || undefined}
          sizes="(max-width: 900px) 100vw, 50vw"
          alt={image.alt}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="wp-react-block__body">
        {title && <h1 className="wp-react-block__title">{title}</h1>}
        {text && <p className="wp-react-block__text">{text}</p>}
        {button?.label && button.url ? (
          <WpButtonLink button={button} />
        ) : buttonLabel && buttonUrl ? (
          <SmartButtonLink href={buttonUrl}>
            {buttonLabel}
          </SmartButtonLink>
        ) : null}
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
          <div key={item.question} className="wp-react-block__faq-item">
            <p className="wp-react-block__faq-item__question">{item.question}</p>
            <p>{item.answer}</p>
          </div>
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
                <SmartImage
                  src={image.url}
                  width={image.width}
                  height={image.height}
                  srcSet={image.srcset || undefined}
                  sizes="(max-width: 560px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
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
            href={`/${slugCollection}/${category.slug}/`}
            className="wp-react-block__category-card"
          >
            <span className="wp-react-block__category-visual">
              {category.image ? (
                <SmartImage
                  src={category.image.url}
                  width={category.image.width}
                  height={category.image.height}
                  srcSet={category.image.srcset || undefined}
                  sizes="(max-width: 560px) 48vw, (max-width: 1000px) 30vw, 180px"
                  alt={category.image.alt || category.name}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="wp-react-block__category-placeholder">Visuel</span>
              )}
            </span>
            <span className="wp-react-block__category-name">{category.name}</span>
            <small>{category.count} titre{category.count > 1 ? 's' : ''}</small>
          </Link>
        ))}
      </div>
    </section>
  )
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function CssGridBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const text = attrString(block, 'text')
  const variant = attrString(block, 'variant') || 'cards'
  const columns = clampNumber(attrNumber(block, 'columns', 3), 1, 6)
  const minColumnWidth = clampNumber(attrNumber(block, 'minColumnWidth', 220), 120, 520)
  const gap = clampNumber(attrNumber(block, 'gap', 24), 0, 80)
  const items = attrItems(block, 'items', ([itemTitle, itemText, url, linkLabel, columnSpan, rowSpan]) => ({
    title: itemTitle,
    text: itemText,
    url,
    linkLabel,
    columnSpan: columnSpan || '1',
    rowSpan: rowSpan || '1',
  })).filter((item) => item.title || item.text)

  if (!title && !text && items.length === 0) {
    return null
  }

  return (
    <section
      className={`wp-react-block wp-react-block--css-grid wp-react-block--css-grid-${variant}`}
      style={{
        '--wp-block-css-grid-columns': columns,
        '--wp-block-css-grid-min-column-width': `${minColumnWidth}px`,
        '--wp-block-css-grid-gap': `${gap}px`,
      } as CSSProperties}
    >
      {(title || text) && (
        <div className="wp-react-block__header">
          {title && <h2 className="wp-react-block__title">{title}</h2>}
          {text && <p className="wp-react-block__text">{text}</p>}
        </div>
      )}
      {items.length > 0 && (
        <div className="wp-react-block__css-grid">
          {items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="wp-react-block__css-grid-item"
              style={{
                '--wp-block-css-grid-item-column-span': clampNumber(Number(item.columnSpan) || 1, 1, columns),
                '--wp-block-css-grid-item-row-span': clampNumber(Number(item.rowSpan) || 1, 1, 4),
              } as CSSProperties}
            >
              {item.title && <h3>{item.title}</h3>}
              {item.text && <p>{item.text}</p>}
              {item.url && (
                <SmartLink className="wp-react-block__link" href={item.url}>
                  {item.linkLabel || 'En savoir plus'}
                </SmartLink>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function ContactFormBlock(_: BlockComponentProps) {
  return <ContactForm />
}

function RelatedProductsBlock({ block }: BlockComponentProps) {
  const title = block.data?.title as string | undefined
  const limit = block.data?.limit as number | undefined
  return <RelatedProducts title={title} limit={limit} />
}

function ProductHighlightBlock({ block }: BlockComponentProps) {
  const eyebrow = attrString(block, 'eyebrow') || 'Le livre du moment'
  const detailLabel = attrString(block, 'buttonLabel') || 'Voir le livre'
  const product = block.data?.product
  const [addStatus, setAddStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')
  const { refresh: refreshCart } = useCart()

  if (!product) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  const addLabel =
    addStatus === 'adding'
      ? 'Ajout...'
      : addStatus === 'added'
        ? 'Ajouté !'
        : addStatus === 'error'
          ? 'Erreur, réessayer'
          : product.add_to_cart.text || 'Ajouter au panier'

  async function handleAddToCart() {
    if (!product) return
    setAddStatus('adding')
    try {
      await addToCart(product.id)
      setAddStatus('added')
      refreshCart()
      window.setTimeout(() => setAddStatus('idle'), 2000)
    } catch {
      setAddStatus('error')
      window.setTimeout(() => setAddStatus('idle'), 2000)
    }
  }

  return (
    <section className="wp-react-block wp-react-block--product-highlight">
      <div className="wp-react-block__body">
        <p className="wp-react-block__eyebrow">{eyebrow}</p>
        <h2 className="wp-react-block__title">{decodeHtml(product.name)}</h2>
        {product.short_description && (
          <div
            className="wp-react-block__text"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}
        <div className="wp-react-block__purchase-row">
          <ProductPrice prices={product.prices} />
          {product.is_purchasable && product.is_in_stock && (
            <Button
              className="wp-react-block__add-button"
              onClick={handleAddToCart}
              disabled={addStatus === 'adding'}
            >
              {addLabel}
            </Button>
          )}
          <ButtonLink
            className="wp-react-block__detail-button"
            to={`/${slugProduct}/${product.slug}/`}
            variant="secondary"
          >
            {detailLabel}
          </ButtonLink>
        </div>
      </div>
      <div className="wp-react-block__featured-visual">
        <div className="wp-react-block__featured-halo" aria-hidden="true" />
        <Link
          href={`/${slugProduct}/${product.slug}/`}
          className="wp-react-block__featured-cover"
        >
          <ProductImage
            images={product.images}
            name={product.name}
            className="wp-react-block__featured-image"
            preferThumbnail={false}
            priority
          />
        </Link>
      </div>
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
        <Button type="submit">
          {buttonLabel}
        </Button>
      </form>
    </section>
  )
}

function InstagramFeedBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title') || 'Instagram'
  const limit = attrNumber(block, 'limit', 12)
  const feedId = attrString(block, 'feedId')

  const { data, isLoading } = useSWR(
    ['instagram-feed', limit, feedId],
    () => getInstagramFeed({ limit, feedId }),
  )
  const items = data?.items ?? []
  const configured = data?.configured ?? false
  const username = items[0]?.username || null

  return (
    <section className="wp-react-block wp-react-block--instagram">
      <div className="wp-react-block__instagram-header">
        {title && <h2 className="wp-react-block__title">{title}</h2>}
        {username && (
          <a
            className="wp-react-block__instagram-username"
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{username}
          </a>
        )}
      </div>

      {isLoading ? (
        <p className="wp-react-block__meta">Chargement Instagram...</p>
      ) : items.length > 0 ? (
        <div className="wp-react-block__instagram-grid">
          {items.map((item) => {
            const isVideo = item.media_type === 'video'
            return (
              <a
                key={item.id}
                className={`wp-react-block__instagram-card${isVideo ? ' wp-react-block__instagram-card--video' : ''}`}
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isVideo ? (
                  <div className="wp-react-block__instagram-video-placeholder" aria-hidden="true">
                    <Play size={32} fill="currentColor" aria-hidden="true" />
                  </div>
                ) : item.media_url ? (
                  <SmartImage
                    src={getInstagramProxyImageUrl(item.media_url)}
                    alt={item.caption || 'Publication Instagram'}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                {item.caption && (
                  <span className="wp-react-block__instagram-caption" aria-hidden="true">
                    <span className="wp-react-block__instagram-caption-text">{item.caption}</span>
                  </span>
                )}
              </a>
            )
          })}
        </div>
      ) : (
        <p className="wp-react-block__meta">
          {configured
            ? 'Aucune publication Instagram n’a pu être chargée.'
            : 'Instagram n’est pas configuré sur ce site.'}
        </p>
      )}
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
          <div key={item.title} className="wp-react-block__accordion-item">
            <p className="wp-react-block__accordion-item__title">{item.title}</p>
            <p>{item.text}</p>
          </div>
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
            <button type="button" onClick={scrollPrevious} aria-label="Slide précédente">
              <ChevronLeft size={20} strokeWidth={2.2} aria-hidden="true" />
            </button>
            <button type="button" onClick={scrollNext} aria-label="Slide suivante">
              <ChevronRight size={20} strokeWidth={2.2} aria-hidden="true" />
            </button>
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
                  <SmartImage
                    src={imgSrc}
                    width={slide.image?.width}
                    height={slide.image?.height}
                    alt={slide.image?.alt ?? ''}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                )}
                <div>
                  {slide.title && <h3>{slide.title}</h3>}
                  {slide.text && <p>{slide.text}</p>}
                  {slide.buttonLabel && slide.buttonUrl && (
                    <SmartButtonLink href={slide.buttonUrl}>{slide.buttonLabel}</SmartButtonLink>
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

function ListBlock({ block }: BlockComponentProps) {
  return (
    <div
      className="wp-react-block wp-react-block--list"
      dangerouslySetInnerHTML={{ __html: blockHtml(block) }}
    />
  )
}

function QuoteBlock({ block }: BlockComponentProps) {
  return (
    <div
      className="wp-react-block wp-react-block--quote"
      dangerouslySetInnerHTML={{ __html: blockHtml(block) }}
    />
  )
}

function SeparatorBlock() {
  return <hr className="wp-react-block wp-react-block--separator" />
}

function summaryFromDetailsBlock(block: WpBlock) {
  const match = blockHtml(block).match(/<summary[^>]*>(.*?)<\/summary>/is)

  return match ? match[1].replace(/<[^>]*>/g, '').trim() : 'Details'
}

function renderInnerBlocks(block: WpBlock) {
  return block.innerBlocks.map((innerBlock, index) => (
    <BlockRenderer
      key={`${innerBlock.blockName ?? 'html'}-${index}`}
      block={innerBlock}
    />
  ))
}

function DetailsBlock({ block }: BlockComponentProps) {
  if (block.innerBlocks.length === 0) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <div className={blockClassName('wp-react-block wp-react-block--details', block)}>
      <p className="wp-react-block__details-summary">{summaryFromDetailsBlock(block)}</p>
      <div className="wp-react-block__details-content">
        {renderInnerBlocks(block)}
      </div>
    </div>
  )
}

function ColumnsBlock({ block }: BlockComponentProps) {
  if (block.innerBlocks.length === 0) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <div
      className={blockClassName('wp-react-block wp-react-block--columns', block, [
        attrHasBoolean(block, 'isStackedOnMobile') && !attrBoolean(block, 'isStackedOnMobile')
          ? 'is-not-stacked-on-mobile'
          : 'is-stacked-on-mobile',
      ]).trim()}
    >
      {renderInnerBlocks(block)}
    </div>
  )
}

function ColumnBlock({ block }: BlockComponentProps) {
  if (block.innerBlocks.length === 0) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <div className={blockClassName('wp-react-block__column', block)}>
      {renderInnerBlocks(block)}
    </div>
  )
}

function GroupBlock({ block }: BlockComponentProps) {
  if (block.innerBlocks.length === 0) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return (
    <div className={blockClassName('wp-react-block wp-react-block--group', block)}>
      {renderInnerBlocks(block)}
    </div>
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

interface PartnerItem { name?: string; description?: string; url?: string }

function PartnersBlock({ block }: BlockComponentProps) {
  const title = attrString(block, 'title')
  const items = (block.attrs.items ?? []) as PartnerItem[]

  if (!items.length) return null
  return (
    <section className="wp-react-block wp-react-block--partners">
      {title && <h2 className="wp-react-block__title" dangerouslySetInnerHTML={{ __html: title }} />}
      <ul className="partners-grid">
        {items.map((item, i) => (
          <li key={i} className="partner-card">
            {item.name && <h3 className="partner-card__name" dangerouslySetInnerHTML={{ __html: item.name }} />}
            {item.description && <p className="partner-card__description">{item.description}</p>}
            {item.url && (
              <SmartLink className="partner-card__link" href={item.url} target="_blank">
                Plus d'infos →
              </SmartLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

const defaultBlockMap: BlockMap = {
  'core/heading': HeadingBlock,
  'core/paragraph': ParagraphBlock,
  'core/image': ImageBlock,
  'core/button': ButtonBlock,
  'core/buttons': ButtonsBlock,
  'core/list': ListBlock,
  'core/list-item': ListBlock,
  'core/quote': QuoteBlock,
  'core/pullquote': QuoteBlock,
  'core/separator': SeparatorBlock,
  'core/details': DetailsBlock,
  'core/columns': ColumnsBlock,
  'core/column': ColumnBlock,
  'core/group': GroupBlock,
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
  'magicieuse/css-grid': CssGridBlock,
  'magicieuse/product-highlight': ProductHighlightBlock,
  'magicieuse/related-products': RelatedProductsBlock,
  'magicieuse/contact-form': ContactFormBlock,
  'magicieuse/newsletter': NewsletterBlock,
  'magicieuse/instagram-feed': InstagramFeedBlock,
  'magicieuse/accordion': AccordionBlock,
  'magicieuse/tabs': TabsBlock,
  'magicieuse/slider': SliderBlock,
  'magicieuse/video-embed': VideoEmbedBlock,
  'magicieuse/steps': StepsBlock,
  'magicieuse/partners': PartnersBlock,
}

export default function BlockRenderer({ block, blockMap = defaultBlockMap }: Props) {
  const Component = block.blockName ? blockMap[block.blockName] : undefined

  if (!Component) {
    if (blockHtml(block).includes('magicieuse-livraison-commande')) {
      return <DeliveryBlock />
    }

    if (blockHtml(block).includes('magicieuse-reassurance')) {
      return <ReassuranceBlock />
    }

    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return <Component block={block} />
}
