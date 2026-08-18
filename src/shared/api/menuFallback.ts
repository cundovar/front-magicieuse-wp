import type { WpMenuItem } from './wordpress'

function menuItem(
  id: number,
  title: string,
  path: string,
  parent: number,
  order: number,
  objectType: string,
): WpMenuItem {
  return {
    id,
    title,
    url: path,
    path,
    target: null,
    parent,
    order,
    is_external: false,
    object_type: objectType,
  }
}

const primaryMenu: WpMenuItem[] = [
  menuItem(114, 'La Magicieuse', '/la-magicieuse-2/', 0, 1, 'page'),
  menuItem(103, 'La Magicieuse', '/la-magicieuse/', 114, 2, 'page'),
  menuItem(23, 'Nos Actus', '/blog/', 114, 3, 'page'),
  menuItem(110, 'Statuts', '/statuts-de-la-magicieuse/', 114, 4, 'page'),
  menuItem(148, 'La Charte', '/la-charte-de-la-magicieuse/', 114, 5, 'page'),
  menuItem(104, 'Les Ami.es', '/nos-ami-es/', 114, 6, 'page'),
  menuItem(321, 'Presse', '/presse/', 114, 7, 'page'),
  menuItem(164, 'Remerciements', '/remerciements/', 114, 8, 'page'),
  menuItem(25, 'Nos Collections', '/collections/', 0, 9, 'page'),
  menuItem(44, 'La Mufassette', '/collections/la-mufassette/', 25, 10, 'product_cat'),
  menuItem(45, 'Le Chameau borgne', '/collections/le-chameau-borgne/', 25, 11, 'product_cat'),
  menuItem(47, 'Les poings fissures', '/collections/les-poings-fissures/', 25, 12, 'product_cat'),
  menuItem(43, 'La Karnovora', '/collections/la-karnovora/', 25, 13, 'product_cat'),
  menuItem(46, 'Les fruits de la fournaise', '/collections/les-fruits-de-la-fournaise/', 25, 14, 'product_cat'),
  menuItem(105, 'Artistes', '/artistes/', 0, 15, 'page'),
  menuItem(26, 'Mon compte', '/mon-compte/', 0, 16, 'custom'),
  menuItem(1709, 'Contact', '/contact/', 0, 17, 'page'),
]

const footerMenu: WpMenuItem[] = [
  menuItem(1610, 'Mon compte', '/mon-compte/', 0, 1, 'page'),
  menuItem(1611, 'Presse', '/presse/', 0, 2, 'page'),
  menuItem(1612, 'Remerciements', '/remerciements/', 0, 3, 'page'),
  menuItem(1613, 'Charte', '/la-charte-de-la-magicieuse/', 0, 4, 'page'),
  menuItem(1708, 'Contact', '/contact/', 0, 5, 'page'),
  menuItem(1718, 'Mentions legales', '/mentions-legales/', 0, 6, 'page'),
  menuItem(1719, 'Conditions generales de vente', '/conditions-generales-de-vente/', 0, 7, 'page'),
  menuItem(1720, 'Politique de confidentialite', '/politique-de-confidentialite/', 0, 8, 'page'),
]

export function getFallbackMenu(location: string): WpMenuItem[] {
  if (location === 'primary') return primaryMenu
  if (location === 'footer') return footerMenu
  return []
}
