import type { WpBlock } from '../../api/wordpress'
import BlockRenderer from './BlockRenderer'

type Props = {
  blocks: WpBlock[]
}

export default function WpStructuredContent({ blocks }: Props) {
  const filtered = blocks.filter(
    (b) => b.blockName !== null || b.innerHTML.trim() !== '',
  )

  return (
    <div className="wp-block-renderer">
      {filtered.map((block, index) => (
        <BlockRenderer
          key={`${block.blockName ?? 'html'}-${index}`}
          block={block}
        />
      ))}
    </div>
  )
}
