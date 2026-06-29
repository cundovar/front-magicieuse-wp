import './WpBlocks.scss'

type Props = {
  html: string
}

const reassuranceIcons: Record<string, string> = {
  '🔒': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></svg>',
  '↗': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 18V6a2 2 0 0 0-2-2H4"/><path d="M15 18H9"/><path d="M19 18h2"/><path d="M3 18h2"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  '✦': '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.5 3.2a1 1 0 0 1 1 0l2.3 5a1 1 0 0 0 .6.6l5 2.3a1 1 0 0 1 0 1.8l-5 2.3a1 1 0 0 0-.6.6l-2.3 5a1 1 0 0 1-1.8 0l-2.3-5a1 1 0 0 0-.6-.6l-5-2.3a1 1 0 0 1 0-1.8l5-2.3a1 1 0 0 0 .6-.6z"/></svg>',
}

function replaceReassuranceEmojiIcons(value: string) {
  return value.replace(
    /<p([^>]class=["'][^"']*\bmagicieuse-reassurance__icon\b[^"']*["'][^>]*)>\s*([🔒↗✦])\s*<\/p>/g,
    (_match, attrs: string, icon: string) => `<p${attrs}>${reassuranceIcons[icon]}</p>`,
  )
}

export default function WpHtmlBlock({ html }: Props) {
  if (!html.trim()) {
    return null
  }

  const normalizedHtml = replaceReassuranceEmojiIcons(html)

  return (
    <div
      className="wp-html-block wp-content"
      dangerouslySetInnerHTML={{ __html: normalizedHtml }}
    />
  )
}
