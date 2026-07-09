import fs from 'node:fs/promises'
import path from 'node:path'

const SITE_URL = 'https://trekform.com'
const OUTPUT_PATH = path.resolve(process.cwd(), 'docs/original-course-content.json')

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function toTokenSet(value) {
  return new Set(
    normalize(value)
      .split(' ')
      .filter((token) => token && !['curso', 'de', 'para', 'y', 'en', 'el', 'la'].includes(token)),
  )
}

function similarityScore(a, b) {
  if (!a.size || !b.size) return 0

  let intersection = 0
  for (const token of a) {
    if (b.has(token)) intersection += 1
  }

  return intersection / new Set([...a, ...b]).size
}

function extract(content, pattern) {
  const match = content.match(pattern)
  return match?.[1]?.trim() ?? ''
}

function repairEncoding(text) {
  if (!text || !/[ÃÂ]/.test(text)) return text

  try {
    return Buffer.from(text, 'latin1').toString('utf8')
  } catch {
    return text
  }
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ntilde;/g, 'Ñ')
}

function cleanText(text) {
  return repairEncoding(decodeEntities(text)).trim()
}

function stripHtml(html) {
  return cleanText(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' '),
  )
}

function extractSidebarSections(sidebarHtml) {
  const sections = [...sidebarHtml.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)].map(
    (match) => ({
      title: stripHtml(match[1]),
      text: stripHtml(match[2]),
    }),
  )

  return {
    certification: sections[0] ?? null,
    quality: sections[1] ?? null,
    fundae: sections[2] ?? null,
  }
}

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`)
  return response.text()
}

async function readLocalCourseMap() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const env = await fs.readFile(envPath, 'utf8')
  const url = env.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1]?.trim()
  const key = env.match(/^VITE_SUPABASE_PUBLISHABLE_KEY=(.+)$/m)?.[1]?.trim()

  if (!url || !key) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local')
  }

  const coursesUrl =
    `${url}/rest/v1/courses?select=slug,title,status,published_at&status=eq.published&order=title.asc`
  const response = await fetch(coursesUrl, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch local courses: ${response.status}`)
  }

  /** @type {Array<{ slug: string, title: string }>} */
  const courses = await response.json()
  return courses.map((course) => ({
    slug: course.slug,
    title: course.title,
    normalized: normalize(course.title),
    slugTokens: toTokenSet(course.slug),
    titleTokens: toTokenSet(course.title),
  }))
}

function matchLocalCourse(sourceTitle, sourceSlug, localCourses, localByTitle) {
  const direct = localByTitle.get(normalize(sourceTitle))
  if (direct) return direct

  const sourceTokens = toTokenSet(`${sourceTitle} ${sourceSlug}`)
  let best = null
  let bestScore = 0

  for (const course of localCourses) {
    const score = Math.max(
      similarityScore(sourceTokens, course.titleTokens),
      similarityScore(sourceTokens, course.slugTokens),
    )

    if (score > bestScore) {
      best = course
      bestScore = score
    }
  }

  return bestScore >= 0.45 ? best : null
}

async function main() {
  const sitemap = await fetchText(`${SITE_URL}/sitemap.xml`)
  const localCourses = await readLocalCourseMap()
  const localByTitle = new Map(localCourses.map((course) => [course.normalized, course]))

  const urls = [...sitemap.matchAll(/<loc>(https:\/\/trekform\.com\/cursos-trekform\/[^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.split('/').length >= 6)
    .filter((url) => !/\/page:\d+$/i.test(url))

  const uniqueUrls = [...new Set(urls)]
  const results = []

  for (const url of uniqueUrls) {
    const html = await fetchText(url)
    const title = cleanText(extract(html, /<title>([^<]+)<\/title>/i).replace(/\s*-\s*Trekform.*$/i, ''))
    const sourceSlug = url.split('/').at(-1) ?? ''
    const matched = matchLocalCourse(title, sourceSlug, localCourses, localByTitle)
    const description = cleanText(extract(html, /<meta name="description" content="([^"]*)"/i))
    const image = cleanText(extract(html, /<meta property="og:image" content="([^"]*)"/i))
    const sidebarHtml = extract(html, /<div class="desccortaderechalateral">([\s\S]*?)<\/div>/i)
    const sidebarSections = extractSidebarSections(sidebarHtml)

    results.push({
      sourceUrl: url,
      sourceSlug,
      sourceTitle: title,
      localSlug: matched?.slug ?? null,
      localTitle: matched?.title ?? null,
      excerpt: description,
      featuredImageUrl: image,
      heroText: description,
      sidebarText: stripHtml(sidebarHtml),
      sidebarSections,
    })
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf8')

  const matched = results.filter((item) => item.localSlug).length
  console.log(`Exported ${results.length} original course pages to ${OUTPUT_PATH}`)
  console.log(`Matched ${matched} pages with local course slugs`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
