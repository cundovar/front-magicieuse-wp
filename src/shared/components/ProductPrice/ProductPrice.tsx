import type { WooPrice } from '../../api/woocommerce'
import { formatWooPrice } from '../../utils/price'
import './ProductPrice.scss'

type Props = {
  prices: WooPrice
}

export default function ProductPrice({ prices }: Props) {
  const { price, regular_price, sale_price, currency_code, currency_minor_unit } = prices
  const isOnSale = sale_price !== '' && sale_price !== '0' && price !== regular_price

  return (
    <span className="product-price">
      {isOnSale && (
        <s className="product-price__regular">
          {formatWooPrice(regular_price, currency_minor_unit, currency_code)}
        </s>
      )}
      <span className={isOnSale ? 'product-price__sale' : 'product-price__current'}>
        {formatWooPrice(price, currency_minor_unit, currency_code)}
      </span>
    </span>
  )
}
