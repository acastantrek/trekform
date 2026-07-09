import fs from 'node:fs/promises'
import path from 'node:path'

const INPUT_PATH = path.resolve(process.cwd(), 'docs/original-course-content.json')

async function readEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const env = await fs.readFile(envPath, 'utf8')

  const url = env.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1]?.trim()
  const serviceRole = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m)?.[1]?.trim()

  if (!url || !serviceRole) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  return { url, serviceRole }
}

async function patchCourse({ url, serviceRole }, slug, payload) {
  const response = await fetch(`${url}/rest/v1/courses?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `PATCH failed with ${response.status}`)
  }

  return response.json()
}

function buildModernPayload(entry) {
  return {
    excerpt: entry.excerpt || null,
    description: entry.excerpt || null,
    hero_text: entry.heroText || entry.excerpt || null,
    seo_description: entry.excerpt || null,
    objectives: null,
    featured_image_url: entry.featuredImageUrl || null,
    is_official_certification: true,
    is_fundae_eligible: true,
    certification_name: 'Diploma acreditativo Trekform',
    sidebar_certification_title: entry.sidebarSections?.certification?.title || null,
    sidebar_certification_text: entry.sidebarSections?.certification?.text || null,
    sidebar_quality_title: entry.sidebarSections?.quality?.title || null,
    sidebar_quality_text: entry.sidebarSections?.quality?.text || null,
    sidebar_fundae_title: entry.sidebarSections?.fundae?.title || null,
    sidebar_fundae_text: entry.sidebarSections?.fundae?.text || null,
  }
}

function buildLegacyPayload(entry) {
  const description = [entry.excerpt, entry.sidebarText].filter(Boolean).join('\n\n')

  return {
    excerpt: entry.excerpt || null,
    description: description || null,
    image_url: entry.featuredImageUrl || null,
  }
}

async function main() {
  const env = await readEnv()
  const raw = await fs.readFile(INPUT_PATH, 'utf8')
  const entries = JSON.parse(raw)
  const matchedEntries = entries.filter((entry) => entry.localSlug)

  let updated = 0
  let modernSchema = true

  for (const entry of matchedEntries) {
    try {
      if (modernSchema) {
        await patchCourse(env, entry.localSlug, buildModernPayload(entry))
      } else {
        await patchCourse(env, entry.localSlug, buildLegacyPayload(entry))
      }
      updated += 1
      continue
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      if (
        modernSchema &&
        /featured_image_url|objectives|certification_name|is_official_certification|hero_text|seo_description|sidebar_/i.test(
          message,
        )
      ) {
        modernSchema = false
        await patchCourse(env, entry.localSlug, buildLegacyPayload(entry))
        updated += 1
        continue
      }

      console.error(`Failed to update ${entry.localSlug}: ${message}`)
    }
  }

  console.log(`Updated ${updated} course records in Supabase`)
  console.log(`Schema mode used: ${modernSchema ? 'modern' : 'legacy'}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
