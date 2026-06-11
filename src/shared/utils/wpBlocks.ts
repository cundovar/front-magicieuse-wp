import type { WpBlock } from '../api/wordpress'

const DEFAULT_RENDERABLE_BLOCKS = new Set([
  'core/heading',
  'core/paragraph',
  'core/image',
  'core/button',
  'core/buttons',
  'woocommerce/product-collection',
  'woocommerce/handpicked-products',
  'woocommerce/products-by-category',
  'magicieuse/hero',
  'magicieuse/cta',
  'magicieuse/featured-products',
  'magicieuse/book-carousel',
  'magicieuse/image-text',
  'magicieuse/faq',
  'magicieuse/gallery',
  'magicieuse/testimonials',
  'magicieuse/category-grid',
  'magicieuse/product-highlight',
  'magicieuse/newsletter',
  'magicieuse/accordion',
  'magicieuse/tabs',
  'magicieuse/slider',
  'magicieuse/video-embed',
  'magicieuse/steps',
  'magicieuse/partners',
  'core/list',
  'core/quote',
  'core/separator',
])

export function hasRenderableBlocks(
  blocks: WpBlock[],
  renderableBlocks = DEFAULT_RENDERABLE_BLOCKS,
): boolean {
  return blocks.some((block) => {
    if (block.blockName && renderableBlocks.has(block.blockName)) {
      return true
    }

    return hasRenderableBlocks(block.innerBlocks, renderableBlocks)
  })
}
