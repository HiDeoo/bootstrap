import type { AstroIntegration } from 'astro'
import { rehypeBsTable } from './rehype'
import { remarkBsParam } from './remark'

export function bootstrap(): AstroIntegration {
  return {
    name: 'bootstrap-integration',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          markdown: {
            rehypePlugins: [rehypeBsTable],
            remarkPlugins: [remarkBsParam],
          },
        })
      },
    },
  }
}
