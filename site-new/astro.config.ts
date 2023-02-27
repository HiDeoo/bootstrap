import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'

import { bootstrap } from './src/libs/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [bootstrap(), mdx()],
  markdown: {
    smartypants: false,
    syntaxHighlight: 'prism',
  },
  site: 'https://getbootstrap.com/',
})
