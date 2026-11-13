// Polite inventory crawl of the current trekform.com (SEO migration, phase 0 in
// docs/deferred-work.md): every sitemap URL with its status and metadata, then the internal
// links found on those pages that are not in the sitemap. Results summarized in docs/seo/.
// Usage: curl -o sitemap.xml https://trekform.com/sitemap.xml
//        node scripts/crawl-trekform-com.mjs sitemap.xml <outDir>
// MAX_EXTRA=<n> limits the second pass (default 1500).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const [sitemapPath, outDir] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })

const ORIGIN = 'https://trekform.com'
const UA = 'Mozilla/5.0 (compatible; site-migration-audit)'
const CONCURRENCY = 2
const DELAY_MS = 350
const MAX_EXTRA = Number(process.env.MAX_EXTRA ?? 1500)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const sitemapXml = readFileSync(sitemapPath, 'utf8')
const sitemapEntries = [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  url: m[1].match(/<loc>(.*?)<\/loc>/)?.[1].trim(),
  lastmod: m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? '',
  priority: m[1].match(/<priority>(.*?)<\/priority>/)?.[1] ?? '',
}))
const sitemapSet = new Set(sitemapEntries.map((e) => e.url))

function decode(text) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(
      /&([a-z]+);/gi,
      (m, name) =>
        ({
          aacute: 'á',
          eacute: 'é',
          iacute: 'í',
          oacute: 'ó',
          uacute: 'ú',
          ntilde: 'ñ',
          Aacute: 'Á',
          Eacute: 'É',
          Iacute: 'Í',
          Oacute: 'Ó',
          Uacute: 'Ú',
          Ntilde: 'Ñ',
          uuml: 'ü',
          iexcl: '¡',
          iquest: '¿',
          ordm: 'º',
          ordf: 'ª',
          euro: '€',
          laquo: '«',
          raquo: '»',
          middot: '·',
          ndash: '–',
          mdash: '—',
        })[name] ?? m,
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? (m[2] ?? m[3] ?? '') : null
}

function metaContent(html, key, value) {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if ((attr(m[0], key) ?? '').toLowerCase() === value) return decode(attr(m[0], 'content') ?? '')
  }
  return ''
}

function normalizeLink(href, base) {
  try {
    const u = new URL(href.replace(/&amp;/g, '&'), base)
    if (!/^https?:$/.test(u.protocol)) return null
    if (!/^(www\.)?trekform\.com$/i.test(u.hostname)) return null
    u.hash = ''
    u.hostname = 'trekform.com'
    u.protocol = 'https:'
    return u.toString()
  } catch {
    return null
  }
}

function parse(html, url) {
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html
  const title = decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const canonicalTag = [...head.matchAll(/<link\b[^>]*>/gi)].find(
    (m) => (attr(m[0], 'rel') ?? '').toLowerCase() === 'canonical',
  )
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((m) => decode(m[1]))
    .filter(Boolean)
  const body = (html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
  const text = decode(body)
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
  const links = new Set()
  for (const m of body.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], 'href')
    const link = href && normalizeLink(href, url)
    if (link) links.add(link)
  }
  const jsonLdTypes = [
    ...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi),
  ].flatMap((m) => [...m[1].matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((t) => t[1]))
  return {
    title,
    description: metaContent(head, 'name', 'description'),
    metaRobots: metaContent(head, 'name', 'robots'),
    canonical: canonicalTag ? attr(canonicalTag[0], 'href') : '',
    ogTitle: metaContent(head, 'property', 'og:title'),
    ogImage: metaContent(head, 'property', 'og:image'),
    h1: h1s[0] ?? '',
    h1Count: h1s.length,
    h2: [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((m) => decode(m[1]))
      .filter(Boolean)
      .slice(0, 15),
    wordCount: text ? text.split(' ').length : 0,
    imgCount: imgs.length,
    imgMissingAlt: imgs.filter((t) => !(attr(t, 'alt') ?? '').trim()).length,
    jsonLdTypes: [...new Set(jsonLdTypes)],
    internalLinks: [...links],
  }
}

async function fetchPage(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const started = Date.now()
    try {
      const res = await fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(25000),
      })
      const type = res.headers.get('content-type') ?? ''
      const location = res.headers.get('location')
      const record = {
        url,
        status: res.status,
        location: location ? new URL(location, url).toString() : '',
        contentType: type,
        xRobotsTag: res.headers.get('x-robots-tag') ?? '',
        ms: Date.now() - started,
      }
      if (res.status === 200 && type.includes('html'))
        Object.assign(record, parse(await res.text(), url))
      else await res.arrayBuffer().catch(() => {})
      if (res.status >= 500 && attempt < 3) {
        await sleep(3000 * attempt)
        continue
      }
      return record
    } catch (error) {
      if (attempt === 3) return { url, status: 0, error: String(error?.message ?? error) }
      await sleep(3000 * attempt)
    }
  }
}

async function crawl(urls, label) {
  const results = new Array(urls.length)
  let next = 0
  let done = 0
  async function worker() {
    while (next < urls.length) {
      const i = next++
      results[i] = await fetchPage(urls[i])
      done++
      if (done % 50 === 0 || done === urls.length) console.log(`[${label}] ${done}/${urls.length}`)
      await sleep(DELAY_MS)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return results
}

const urls = sitemapEntries.map((e) => e.url)
console.log(`Sitemap: ${urls.length} URLs`)
const pages = await crawl(urls, 'sitemap')
pages.forEach((p, i) =>
  Object.assign(p, {
    source: 'sitemap',
    lastmod: sitemapEntries[i].lastmod,
    priority: sitemapEntries[i].priority,
  }),
)
writeFileSync(join(outDir, 'pages-sitemap.json'), JSON.stringify(pages, null, 1))

// Internal links not in the sitemap, with how many sitemap pages link to them.
const inlinks = new Map()
for (const p of pages)
  for (const l of p.internalLinks ?? []) inlinks.set(l, (inlinks.get(l) ?? 0) + 1)
const skip = /\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?)(\?|$)/i
const extra = [...inlinks.keys()]
  .filter(
    (u) =>
      !sitemapSet.has(u) &&
      !skip.test(u) &&
      !/\/(panel|admin|login|users|register)\//.test(new URL(u).pathname),
  )
  .sort((a, b) => inlinks.get(b) - inlinks.get(a))
console.log(`Internal links not in sitemap: ${extra.length} (crawling up to ${MAX_EXTRA})`)
const extraPages = await crawl(extra.slice(0, MAX_EXTRA), 'extra')
extraPages.forEach((p) => Object.assign(p, { source: 'link', inlinks: inlinks.get(p.url) }))
writeFileSync(join(outDir, 'pages-extra.json'), JSON.stringify(extraPages, null, 1))
for (const p of pages) p.inlinks = inlinks.get(p.url) ?? 0
writeFileSync(join(outDir, 'pages-sitemap.json'), JSON.stringify(pages, null, 1))
console.log('Done')
