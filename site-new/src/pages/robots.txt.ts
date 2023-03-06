export async function get() {
  const isProduction = import.meta.env.PROD
  // TODO(HiDeoo) Test this works as expected
  const isNetlify = import.meta.env.NETLIFY === 'true'

  const allowCrawling = !isNetlify && isProduction

  const body = `# www.robotstxt.org

${allowCrawling ? '# Allow crawling of all content' : ''}
User-agent: *
Disallow: ${allowCrawling ? '' : '/'}
`

  // TODO(HiDeoo) Sitemap

  return { body }
}
