import fs from 'node:fs'
import path from 'node:path'
import mdx from '@astrojs/mdx'
import type { AstroIntegration } from 'astro'
import autoImport from 'astro-auto-import'
import { rehypeBsTable } from './rehype'
import { remarkBsParam, remarkBsDocsref } from './remark'

// TODO(HiDeoo) Fix path when moving to `site`
// The docs directory path relative to the root of the project.
const docsDirectory = './site-new'

// A list of directories in `src/components` that contains components that will be auto imported in all pages for
// convenience.
// Note: adding a new component to one of the existing directories requires a restart of the dev server.
const autoImportedComponentDirectories = ['callouts', 'shortcodes']

export function bootstrap(): AstroIntegration[] {
  return [
    bootstrap_auto_import(),
    {
      name: 'bootstrap-integration',
      hooks: {
        'astro:config:setup': ({ addWatchFile, updateConfig }) => {
          addWatchFile(path.posix.join(process.cwd(), 'site-new/src/libs/astro.ts'))

          updateConfig({
            markdown: {
              rehypePlugins: [rehypeBsTable],
              remarkPlugins: [remarkBsParam, remarkBsDocsref],
            },
          })
        },
      },
    },
    mdx(),
  ]
}

function bootstrap_auto_import() {
  const autoImportedComponents: string[] = []

  for (const autoImportedComponentDirectory of autoImportedComponentDirectories) {
    const components = fs.readdirSync(
      path.posix.join(process.cwd(), docsDirectory, 'src/components', autoImportedComponentDirectory),
      {
        withFileTypes: true,
      }
    )

    for (const component of components) {
      if (component.isFile()) {
        autoImportedComponents.push(
          `./${path.posix.join(docsDirectory, 'src/components', autoImportedComponentDirectory, component.name)}`
        )
      }
    }
  }

  return autoImport({
    imports: autoImportedComponents,
  })
}
