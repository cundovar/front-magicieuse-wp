import { useState } from 'react'
import { ListFilter, X } from 'lucide-react'
import type { WpBlock } from '../../shared/api/wordpress'
import type { ProductQueryParams } from '../../shared/api/woocommerce'
import './ShopFilters.scss'

type FiltersConfig = {
  showCollections?: boolean
  showPrice?: boolean
  showTheme?: boolean
  sortEnabled?: boolean
  layout?: 'drawer' | 'sidebar' | 'topbar'
}

type FiltersData = {
  categories?: Array<{ id: number; name: string; slug: string; count: number }>
  priceRange?: { min: number; max: number }
  themes?: Array<{ id: number; name: string; slug: string }>
}

type Props = {
  block: WpBlock
  filters: ProductQueryParams
  onFiltersChange: (f: ProductQueryParams) => void
}

function sortKey(f: ProductQueryParams): string {
  if (f.orderby === 'price') return f.order === 'asc' ? 'price-asc' : 'price-desc'
  if (f.orderby === 'popularity') return 'popularity'
  return ''
}

function applySort(sort: string, f: ProductQueryParams): ProductQueryParams {
  const base = { ...f, orderby: undefined, order: undefined }
  if (sort === 'price-asc') return { ...base, orderby: 'price', order: 'asc' }
  if (sort === 'price-desc') return { ...base, orderby: 'price', order: 'desc' }
  if (sort === 'popularity') return { ...base, orderby: 'popularity', order: 'desc' }
  return base
}

export default function ShopFilters({ block, filters, onFiltersChange }: Props) {
  const config = block.attrs as FiltersConfig
  const data = block.data as FiltersData | null

  const showCollections = config.showCollections !== false
  const showPrice       = config.showPrice !== false
  const showTheme       = config.showTheme === true
  const sortEnabled     = config.sortEnabled !== false
  const layout          = config.layout ?? 'drawer'

  const categories = data?.categories ?? []
  const priceRange = data?.priceRange
  const themes     = data?.themes ?? []

  const [open, setOpen] = useState(false)
  const [localMin, setLocalMin] = useState(
    filters.minPrice != null ? String(Math.round(filters.minPrice / 100)) : '',
  )
  const [localMax, setLocalMax] = useState(
    filters.maxPrice != null ? String(Math.round(filters.maxPrice / 100)) : '',
  )

  const activeCount = [
    filters.category ? 1 : 0,
    filters.minPrice != null || filters.maxPrice != null ? 1 : 0,
    filters.orderby ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  function handleCategory(slug: string) {
    onFiltersChange({ ...filters, category: filters.category === slug ? undefined : slug })
  }

  function handlePriceApply() {
    const minEuro = localMin !== '' ? Number(localMin) : null
    const maxEuro = localMax !== '' ? Number(localMax) : null
    onFiltersChange({
      ...filters,
      minPrice: minEuro != null ? Math.round(minEuro * 100) : undefined,
      maxPrice: maxEuro != null ? Math.round(maxEuro * 100) : undefined,
    })
  }

  function handleReset() {
    setLocalMin('')
    setLocalMax('')
    onFiltersChange({})
  }

  const panelContent = (
    <div className="shop-filters__body">
      {showCollections && categories.length > 0 && (
        <section className="shop-filters__section">
          <h3 className="shop-filters__section-title">Collections</h3>
          <ul className="shop-filters__list">
            {categories.map(cat => (
              <li key={cat.id}>
                <label className={`shop-filters__option${filters.category === cat.slug ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="shop-cat"
                    value={cat.slug}
                    checked={filters.category === cat.slug}
                    onChange={() => handleCategory(cat.slug)}
                  />
                  <span>{cat.name}</span>
                  {cat.count > 0 && <span className="shop-filters__count">{cat.count}</span>}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showPrice && (
        <section className="shop-filters__section">
          <h3 className="shop-filters__section-title">Prix</h3>
          <div className="shop-filters__price-range">
            <div className="shop-filters__price-input">
              <label htmlFor="sf-min">Min</label>
              <input
                id="sf-min"
                type="number"
                min={0}
                value={localMin}
                placeholder={priceRange ? String(Math.floor(priceRange.min)) : '0'}
                onChange={e => setLocalMin(e.target.value)}
                onBlur={handlePriceApply}
                onKeyDown={e => e.key === 'Enter' && handlePriceApply()}
              />
            </div>
            <span className="shop-filters__price-sep">—</span>
            <div className="shop-filters__price-input">
              <label htmlFor="sf-max">Max</label>
              <input
                id="sf-max"
                type="number"
                min={0}
                value={localMax}
                placeholder={priceRange ? String(Math.ceil(priceRange.max)) : '999'}
                onChange={e => setLocalMax(e.target.value)}
                onBlur={handlePriceApply}
                onKeyDown={e => e.key === 'Enter' && handlePriceApply()}
              />
            </div>
          </div>
        </section>
      )}

      {showTheme && themes.length > 0 && (
        <section className="shop-filters__section">
          <h3 className="shop-filters__section-title">Thème</h3>
          <ul className="shop-filters__list">
            {themes.map(t => (
              <li key={t.id}>
                <label className="shop-filters__option">
                  <input type="radio" name="shop-theme" value={t.slug} />
                  <span>{t.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sortEnabled && (
        <section className="shop-filters__section">
          <h3 className="shop-filters__section-title">Trier par</h3>
          <select
            className="shop-filters__select"
            value={sortKey(filters)}
            onChange={e => onFiltersChange(applySort(e.target.value, filters))}
          >
            <option value="">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="popularity">Popularité</option>
          </select>
        </section>
      )}
    </div>
  )

  if (layout === 'sidebar') {
    return (
      <aside className="shop-filters shop-filters--sidebar">
        <div className="shop-filters__sidebar-header">
          <span className="shop-filters__sidebar-title">Filtres</span>
          {activeCount > 0 && (
            <button className="shop-filters__reset-link" onClick={handleReset}>
              Tout effacer
            </button>
          )}
        </div>
        {panelContent}
      </aside>
    )
  }

  return (
    <div className="shop-filters shop-filters--drawer">
      <button
        className={`shop-filters__trigger${activeCount > 0 ? ' has-filters' : ''}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <ListFilter size={16} aria-hidden="true" />
        Filtrer
        {activeCount > 0 && (
          <span className="shop-filters__badge" aria-label={`${activeCount} filtre${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''}`}>
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="shop-filters__overlay" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="shop-filters__panel" role="dialog" aria-modal="true" aria-label="Filtres">
            <div className="shop-filters__panel-header">
              <h2>Filtres</h2>
              <button className="shop-filters__close" onClick={() => setOpen(false)} aria-label="Fermer les filtres">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {panelContent}
            <div className="shop-filters__panel-footer">
              {activeCount > 0 && (
                <button className="shop-filters__reset" onClick={handleReset}>
                  Tout effacer
                </button>
              )}
              <button className="shop-filters__apply" onClick={() => setOpen(false)}>
                Voir les résultats
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
