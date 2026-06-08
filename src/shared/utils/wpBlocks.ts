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
  'magicieuse/featured-products',
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
