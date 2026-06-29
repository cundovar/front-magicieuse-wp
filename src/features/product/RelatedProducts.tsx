import useSWR from 'swr'
import { getProductsByCategory } from '../../shared/api/woocommerce'
import { useProductContext } from './ProductContext'
import ProductCard from '../shop/ProductCard'

type Props = {
  title?: string
  limit?: number
}

export default function RelatedProducts({ title = 'Dans la même collection', limit = 8 }: Props) {
  const product = useProductContext()
  const category = product?.categories?.[0]

  const { data: related = [] } = useSWR(
    category ? ['related-products', category.slug] : null,
    ([, slug]: [string, string]) => getProductsByCategory(slug),
  )

  const others = related.filter((p) => p.id !== product?.id).slice(0, limit)

  if (!product || !category || others.length === 0) return null

  return (
    <section className="related-products">
      <h2 className="related-products__title">{title}</h2>
      <div className="related-products__grid">
        {others.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
