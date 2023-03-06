import type { HTMLAttributes } from 'astro/types'
import * as htmlparser2 from 'htmlparser2'
import { getData } from './data'

const placeholderRegex = /<Placeholder\s+([^>]+)\/>/g

/**
 * Generates all the placeholder attributes and options required to render a placeholder.
 * @see src/components/shortcodes/Placeholder.astro
 */
export function getPlaceholder(userOptions: Partial<PlaceholderOptions>): Placeholder {
  const options = getOptionsWithDefaults(userOptions)
  const { class: className, height, markup, text, title, width } = options

  const showText = text !== false
  const showTitle = title !== false

  const placeholderClassList = ['bd-placeholder-img', className].join(' ')
  const placeholderRole = showTitle || showText ? 'img' : undefined
  const placeholderAriaHidden = !showText && !showTitle ? 'true' : undefined

  const placeholderLabel =
    showText || showTitle
      ? `${showTitle ? title : ''}${showTitle && showText ? ': ' : ''}${showText ? text : ''}`
      : undefined

  const optionsWithVisibilities = { ...options, showText, showTitle }

  if (markup === 'img') {
    return {
      type: 'img',
      options: optionsWithVisibilities,
      props: {
        alt: placeholderLabel,
        class: placeholderClassList,
        height,
        src: getPlaceholderSrc(showTitle, showText, options),
        width,
      },
    }
  }

  return {
    type: 'svg',
    options: optionsWithVisibilities,
    props: {
      'aria-hidden': placeholderAriaHidden,
      'aria-label': placeholderLabel,
      class: placeholderClassList,
      focusable: 'false',
      height,
      preserveAspectRatio: 'xMidYMid slice',
      role: placeholderRole,
      width,
      xmlns: 'http://www.w3.org/2000/svg',
    },
  }
}

/**
 * Replaces placeholders described using the `<Placeholder />` component in HTML markup with the expected HTML content.
 * This is useful to render examples that have a pretty large set of constraints:
 *
 *  - The provided HTML code is not valid MDX (e.g. unclosed void elements like <img>) but can contain the
 *      `<Placeholder />` Astro component. This means that we cannot use an Astro slot for example that requires valid
 *      MDX.
 *  - The provided HTML code cannot be parsed in a forgiving way with XML mode enabled (to not lose the structure due
 *      to self-closing MDX or Astro components) and serialized back to a string while closing all known void elements
 *      in order to render it as MDX using `@mdx-js/mdx` & `astro/jsx-runtime`. This works perfectly (tested) but the
 *      DOM needs to contains the exact same HTML markup (even indentation) provided to the example as it is used on the
 *      client to send the example to StackBlitz with the same indentation as the original example.
 *
 * If you are not sure if you need to use this function, you probably don't.
 */
export function replacePlaceholdersInHtml(html: string) {
  return html.replace(placeholderRegex, (match) => {
    const document = htmlparser2.parseDocument(match, { xmlMode: true })
    const placeholderElement = document.firstChild

    if (
      document.children.length > 1 ||
      !placeholderElement ||
      placeholderElement.type !== htmlparser2.ElementType.Tag ||
      placeholderElement.name !== 'Placeholder'
    ) {
      throw new Error('Invalid placeholder element.')
    }

    const placeholder = getPlaceholder(sanitizeHtmlAttributesFromMdx(placeholderElement.attribs))

    return renderPlaceholderToString(placeholder)
  })
}

function renderPlaceholderToString(placeholder: Placeholder) {
  let placeholderStr = `<${placeholder.type}`

  for (const [key, value] of Object.entries(placeholder.props)) {
    if (value === undefined) {
      continue
    }

    placeholderStr = `${placeholderStr} ${key}="${value}"`
  }

  if (placeholder.type === 'img') {
    return `${placeholderStr} />`
  }

  placeholderStr = `${placeholderStr}>`

  if (placeholder.options.showTitle) {
    placeholderStr = `${placeholderStr}<title>${placeholder.options.title}</title>`
  }

  placeholderStr = `${placeholderStr}<rect width="100%" height="100%" fill="${placeholder.options.background}" />`

  if (placeholder.options.showText) {
    placeholderStr = `${placeholderStr}<text x="50%" y="50%" fill="${placeholder.options.color}" dy=".3em">${placeholder.options.text}</text>`
  }

  return `${placeholderStr}</${placeholder.type}>`
}

function getOptionsWithDefaults(options: Partial<PlaceholderOptions>) {
  const optionsWithDefaults = Object.assign(
    {},
    {
      background: getData('grays')[5].hex,
      color: getData('grays')[2].hex,
      height: '180',
      markup: 'svg',
      title: 'Placeholder',
      width: '100%',
    },
    options
  )

  if (optionsWithDefaults.text === undefined) {
    optionsWithDefaults.text = `${optionsWithDefaults.width}x${optionsWithDefaults.height}`
  }

  return optionsWithDefaults as PlaceholderOptions
}

function getPlaceholderSrc(
  showTitle: boolean,
  showText: boolean,
  { background, color, text, title }: PlaceholderOptions
) {
  // Sanitize the background and text colors by removing the leading hash if any.
  const bgColor = background.replace(/^#/, '')
  const textColor = color.replace(/^#/, '')

  // Inline the SVG with the `data:` URI scheme.
  let placeholderSrc = `data:image/svg+xml,%3Csvg%20style='font-size:%201.125rem;%20font-family:system-ui,-apple-system,%22Segoe%20UI%22,Roboto,%22Helvetica%20Neue%22,%22Noto%20Sans%22,%22Liberation%20Sans%22,Arial,sans-serif,%22Apple%20Color%20Emoji%22,%22Segoe%20UI%20Emoji%22,%22Segoe%20UI%20Symbol%22,%22Noto%20Color%20Emoji%22;%20-webkit-user-select:%20none;%20-moz-user-select:%20none;%20user-select:%20none;%20text-anchor:%20middle;'%20width='200'%20height='200'%20xmlns='http://www.w3.org/2000/svg'%3E`

  if (showTitle) {
    // Append the <title> tag if any.
    placeholderSrc = `${placeholderSrc}%3Ctitle%3E${title}%3C/title%3E`
  }

  // Fill the image rect with the expected background color.
  placeholderSrc = `${placeholderSrc}%3Crect%20width='100%25'%20height='100%25'%20fill='%23${bgColor}'%3E%3C/rect%3E`

  if (showText) {
    // Append the <text> tag if any with the expected color.
    placeholderSrc = `${placeholderSrc}%3Ctext%20x='50%25'%20y='50%25'%20fill='%23${textColor}'%20dy='.3em'%3E${text}%3C/text%3E`
  }

  // Close the SVG.
  placeholderSrc = `${placeholderSrc}%3C/svg%3E`

  return placeholderSrc
}

function sanitizeHtmlAttributesFromMdx(attributes: Record<string, unknown>) {
  const sanitizedAttributes: typeof attributes = {}

  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined) {
      continue
    } else if (value === '{false}') {
      sanitizedAttributes[key] = false
    } else if (value === '{true}') {
      sanitizedAttributes[key] = true
    } else {
      sanitizedAttributes[key] = value
    }
  }

  return sanitizedAttributes
}

export interface PlaceholderOptions {
  /**
   * The SVG background color.
   * @default "#868e96"
   */
  background: string
  /**
   * CSS classes to append to `bd-placeholder-img` for the `svg` or `img` elements.
   */
  class?: string
  /**
   * The text color (foreground).
   * @default "#dee2e6"
   */
  color: string
  /**
   * The placeholder height.
   * @default "180"
   */
  height: string
  /**
   * If it should render `svg` or `img` tags.
   * @default "svg"
   */
  markup: 'img' | 'svg'
  /**
   * The text to show in the image. You can explicitely pass the `false` boolean value (and not the string "false") to
   * hide the text.
   * @default "${width}x{$height)"
   */
  text: string | false
  /**
   * Used in the SVG `title` tag. You can explicitely pass the `false` boolean value (and not the string "false") to
   * hide the title.
   * @default "Placeholder"
   */
  title: string | false
  /**
   * The placeholder width.
   * @default "100%"
   */
  width: string
}

interface PlaceholderVisibilities {
  showText: boolean
  showTitle: boolean
}

type Placeholder =
  | {
      type: 'img'
      options: PlaceholderOptions & PlaceholderVisibilities
      props: HTMLAttributes<'img'>
    }
  | {
      type: 'svg'
      options: PlaceholderOptions & PlaceholderVisibilities
      props: HTMLAttributes<'svg'>
    }
