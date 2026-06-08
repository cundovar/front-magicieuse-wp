import './WpBlocks.scss'

type Props = {
  html: string
}

export default function WpHtmlBlock({ html }: Props) {
  if (!html.trim()) {
    return null
  }

  return (
    <div
      className="wp-html-block wp-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
