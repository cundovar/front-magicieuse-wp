import type { ComponentType } from 'react'
import type { WpBlock } from '../../api/wordpress'
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

  return (
    <section className="wp-react-block wp-react-block--book-carousel">
      {title && <h2 className="wp-react-block__title">{title}</h2>}
      {products.length > 0 ? (
        <ProductList products={products} />
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
}

export default function BlockRenderer({ block, blockMap = defaultBlockMap }: Props) {
  const Component = block.blockName ? blockMap[block.blockName] : undefined

  if (!Component) {
    return <WpHtmlBlock html={blockHtml(block)} />
  }

  return <Component block={block} />
}
