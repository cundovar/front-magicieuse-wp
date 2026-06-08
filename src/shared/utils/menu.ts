import type { WpMenuItem } from '../api/wordpress'

export type MenuItem = WpMenuItem & { children: WpMenuItem[] }

export function buildMenuTree(items: WpMenuItem[]): MenuItem[] {
  return items
    .filter((item) => item.parent === 0)
    .map((item) => ({
      ...item,
      children: items.filter((child) => child.parent === item.id),
    }))
}
