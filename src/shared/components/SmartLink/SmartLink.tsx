'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  className?: string
  children: ReactNode
}

function isInternalUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith('/')) return true

  try {
    return new URL(url).hostname === window.location.hostname
  } catch {
    return false
  }
}

export default function SmartLink({ href, className, children, target, rel, ...props }: Props) {
  if (isInternalUrl(href) && !target) {
    return (
      <Link className={className} href={href} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a
      className={className}
      href={href}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      {...props}
    >
      {children}
    </a>
  )
}
