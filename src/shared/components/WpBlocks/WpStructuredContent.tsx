import type { WpBlock } from '../../api/wordpress'
import BlockRenderer from './BlockRenderer'

type Props = {
  blocks: WpBlock[]
}

export default function WpStructuredContent({ blocks }: Props) {
  return (
    <div className="wp-block-renderer">
      {blocks.map((block, index) => (
        <BlockRenderer
          key={`${block.blockName ?? 'html'}-${index}`}
          block={block}
        />
      ))}
    </div>
  )
}
