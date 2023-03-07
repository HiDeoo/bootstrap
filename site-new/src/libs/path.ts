import path from 'node:path'
import { getConfig } from './config'

// The docs directory path relative to the root of the project.
export const docsDirectory = getConfig().docsDir

export function getVersionedDocsPath(docsPath: string): string {
  const { docs_version } = getConfig()

  return `/docs/${docs_version}/${docsPath.replace(/^\//, '')}`
}

export function getVersionedBsCssPath(direction: 'rtl' | undefined): string {
  let bsCssLinkHref = '/dist/css/bootstrap'

  if (direction === 'rtl') {
    bsCssLinkHref = `${bsCssLinkHref}.rtl`
  }

  if (import.meta.env.PROD) {
    bsCssLinkHref = `${bsCssLinkHref}.min`
  }

  bsCssLinkHref = `${bsCssLinkHref}.css`

  return getVersionedDocsPath(bsCssLinkHref)
}

export function getVersionedBsJsPath(): string {
  let bsJsScriptSrc = '/dist/js/bootstrap.bundle'

  if (import.meta.env.PROD) {
    bsJsScriptSrc = `${bsJsScriptSrc}.min`
  }

  bsJsScriptSrc = `${bsJsScriptSrc}.js`

  return getVersionedDocsPath(bsJsScriptSrc)
}

export function getDocsRelativePath(docsPath: string) {
  return path.join(docsDirectory, docsPath)
}

export function getDocsStaticFsPath() {
  return path.join(getDocsFsPath(), 'static')
}

export function getDocsPublicFsPath() {
  return path.join(getDocsFsPath(), 'public')
}

export function getDocsFsPath() {
  return path.join(process.cwd(), docsDirectory)
}
