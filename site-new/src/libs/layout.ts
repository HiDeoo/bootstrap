import type { HTMLAttributes, HTMLTag } from 'astro/types'

export type Layout = 'docs' | 'examples' | undefined

export type LayoutOverridesHTMLAttributes<TTag extends HTMLTag> = HTMLAttributes<TTag> & {
  [key in `data-${string}`]: string
}
