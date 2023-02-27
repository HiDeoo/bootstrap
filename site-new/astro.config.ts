import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'

import { remarkBsParam } from './src/libs/remark'

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkBsParam],
    syntaxHighlight: 'prism',
  },
  site: 'https://getbootstrap.com/',
})
