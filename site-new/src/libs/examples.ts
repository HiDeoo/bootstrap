import type { AstroInstance } from 'astro'
import fs from 'node:fs'
import path from 'node:path'
import { getDocsFsPath } from './path'

export interface ExampleFrontmatter {
  body_class?: string
  direction?: 'rtl' | undefined
  extra_css?: string[]
  extra_js?: { async?: boolean; src: string }[]
  html_class?: string
  include_js?: boolean
  title: string
}

export function getExamplesAssets() {
  const source = path.join(getDocsFsPath(), 'src/assets/examples')

  return getExamplesAssetsRecursively(source)
}

export function getAliasedExamplesPages(pages: AstroInstance[]) {
  return pages.filter(isAliasedAstroInstance)
}

export function getExampleNameFromPagePath(examplePath: string) {
  const matches = examplePath.match(/([^/]+)\/(?:[^/]+)\.astro$/)

  if (!matches || !matches[1]) {
    throw new Error(`Failed to get example name from path: '${examplePath}'.`)
  }

  return matches[1]
}

function getExamplesAssetsRecursively(source: string, assets: string[] = []) {
  const entries = fs.readdirSync(source, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile() && !entry.name.endsWith('.astro')) {
      assets.push(sanitizeAssetPath(path.join(source, entry.name)))
    } else if (entry.isDirectory()) {
      getExamplesAssetsRecursively(path.join(source, entry.name), assets)
    }
  }

  return assets
}

function sanitizeAssetPath(assetPath: string) {
  const matches = assetPath.match(/([^\/]+\/[^\/]+\.\w+)$/)

  if (!matches || !matches[1]) {
    throw new Error(`Failed to get example asset path from path: '${assetPath}'.`)
  }

  return matches[1]
}

function isAliasedAstroInstance(page: AstroInstance): page is AliasedAstroInstance {
  return (page as AliasedAstroInstance).aliases !== undefined
}

type AliasedAstroInstance = AstroInstance & { aliases: string | string[] }
