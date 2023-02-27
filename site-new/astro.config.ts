import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'

import { rehypeBsTable } from './src/libs/rehype'
import { remarkBsParam } from './src/libs/remark'

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeBsTable],
    remarkPlugins: [remarkBsParam],
    syntaxHighlight: 'prism',
  },
  site: 'https://getbootstrap.com/',
})
