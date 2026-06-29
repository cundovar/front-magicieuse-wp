import { Link } from 'react-router-dom'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { SmartLink } from '../SmartLink'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'icon'
type ButtonSize = 'sm' | 'md' | 'lg'

type CommonProps = {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

function buttonClassName({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: Omit<CommonProps, 'children'>) {
  return [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ className, variant, size, fullWidth })}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

type ButtonLinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string
  }

export function ButtonLink({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  to,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ className, variant, size, fullWidth })}
      to={to}
      {...props}
    >
      {children}
    </Link>
  )
}

type SmartButtonLinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

export function SmartButtonLink({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  href,
  target,
  rel,
  ...props
}: SmartButtonLinkProps) {
  return (
    <SmartLink
      className={buttonClassName({ className, variant, size, fullWidth })}
      href={href}
      target={target}
      rel={rel}
      {...props}
    >
      {children}
    </SmartLink>
  )
}
