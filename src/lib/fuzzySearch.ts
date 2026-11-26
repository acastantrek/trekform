// Typo-tolerant ("fuzzy") search for small in-memory catalogs, plus a Google-style
// "¿Quisiste decir…?" suggestion built from the catalog's own vocabulary.
// No dependencies: the catalog is a few dozen items, so a plain scan is plenty fast.

export interface SearchField {
  text: string | null | undefined
  /** Matches in heavier fields (e.g. the title) rank the item higher. */
  weight: number
  /** Words from this field may be offered as spelling corrections. */
  suggest?: boolean
}

interface IndexedItem<T> {
  item: T
  order: number
  words: Map<string, number>
  /** Word count of the suggestion fields (the title): shorter, more specific titles win ties. */
  titleLength: number
}

export interface SearchIndex<T> {
  items: IndexedItem<T>[]
  /** normalized word -> how it should be displayed (accents kept) and how often it appears */
  vocabulary: Map<string, { display: string; count: number }>
}

export interface SearchResult<T> {
  items: T[]
  /** Corrected query to offer, or null when the query already looks right. */
  suggestion: string | null
}

// Words too common to carry meaning in a course search.
const stopWords = new Set([
  'a',
  'al',
  'con',
  'curso',
  'cursos',
  'de',
  'del',
  'el',
  'en',
  'la',
  'las',
  'los',
  'o',
  'para',
  'por',
  'un',
  'una',
  'y',
])

export function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function splitWords(value: string) {
  return value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
}

function tokenize(value: string) {
  return splitWords(value)
    .map(normalizeText)
    .filter((word) => !stopWords.has(word))
}

// Optimal string alignment distance: insertions, deletions, substitutions and swapped
// neighbours ("carretlila") each cost 1. Stops early once `max` is exceeded.
function editDistance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prevPrev: number[] = []
  let prev = Array.from({ length: b.length + 1 }, (_, index) => index)

  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(prev[j] + 1, current[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prevPrev[j - 2] + 1)
      }
      current.push(value)
      rowMin = Math.min(rowMin, value)
    }
    if (rowMin > max) return max + 1
    prevPrev = prev
    prev = current
  }
  return prev[b.length]
}

// Longer words tolerate more typos; very short ones must be typed exactly.
function allowedTypos(length: number) {
  if (length <= 3) return 0
  if (length <= 5) return 1
  if (length <= 8) return 2
  return 3
}

// Collapses runs like "carretillasss" or "cmprarrr" so stuck keys don't count as typos.
function squeezeRepeats(word: string) {
  return word.replace(/(.)\1{2,}/g, '$1$1')
}

/**
 * How well `token` (what the user typed) matches `word` (a word in the catalog), from 0 (no
 * match) to 1 (exact). Handles words still being typed ("carreti") and typos in both cases.
 */
function matchQuality(token: string, word: string) {
  if (word === token) return 1
  if (token.length >= 2 && word.startsWith(token)) return 0.9
  if (token.length >= 4 && word.includes(token)) return 0.75

  const max = allowedTypos(token.length)
  if (max === 0) return 0

  const distance = editDistance(token, word, max)
  if (distance <= max) return 0.7 - (distance / token.length) * 0.5

  // Typo in a word that isn't finished yet: compare against the word's beginning.
  if (word.length > token.length) {
    const prefixDistance = editDistance(token, word.slice(0, token.length), max)
    if (prefixDistance <= max) return 0.6 - (prefixDistance / token.length) * 0.5
  }
  return 0
}

export function createSearchIndex<T>(
  items: T[],
  fieldsFor: (item: T) => SearchField[],
): SearchIndex<T> {
  const vocabulary: SearchIndex<T>['vocabulary'] = new Map()

  const indexed = items.map((item, order) => {
    const words = new Map<string, number>()
    let titleLength = 0
    for (const field of fieldsFor(item)) {
      if (!field.text) continue
      if (field.suggest) titleLength += splitWords(field.text).length
      for (const raw of splitWords(field.text)) {
        const word = normalizeText(raw)
        if (stopWords.has(word)) continue
        words.set(word, Math.max(words.get(word) ?? 0, field.weight))
        if (field.suggest && word.length >= 3) {
          const entry = vocabulary.get(word)
          if (entry) entry.count++
          else vocabulary.set(word, { display: raw, count: 1 })
        }
      }
    }
    return { item, order, words, titleLength }
  })

  return { items: indexed, vocabulary }
}

function bestMatch(token: string, words: Map<string, number>) {
  let best = 0
  for (const [word, weight] of words) {
    const quality = matchQuality(token, word)
    if (quality > 0) best = Math.max(best, quality * weight)
  }
  return best
}

// Closest catalog word to a token that isn't in the catalog as typed.
function correctToken(token: string, vocabulary: SearchIndex<unknown>['vocabulary']) {
  const exact = vocabulary.get(token)
  if (exact) return exact.display
  for (const word of vocabulary.keys()) {
    if (token.length >= 3 && word.startsWith(token)) return null // still typing, fine as is
  }

  const max = allowedTypos(token.length)
  if (max === 0) return null

  let best: { display: string; distance: number; count: number } | null = null
  for (const [word, entry] of vocabulary) {
    const distance = editDistance(token, word, max)
    if (distance > max) continue
    if (
      !best ||
      distance < best.distance ||
      (distance === best.distance && entry.count > best.count)
    ) {
      best = { display: entry.display, distance, count: entry.count }
    }
  }
  return best?.display ?? null
}

function suggestQuery(query: string, vocabulary: SearchIndex<unknown>['vocabulary']) {
  let changed = false
  const corrected = splitWords(query).map((raw) => {
    const token = normalizeText(raw)
    if (stopWords.has(token)) return raw
    const squeezed = squeezeRepeats(token)
    const fixed = correctToken(squeezed, vocabulary) ?? correctToken(token, vocabulary)
    if (!fixed) return raw
    // Words already right are still shown as the catalog spells them (with accents).
    if (normalizeText(fixed) !== token) changed = true
    return fixed.toLowerCase()
  })
  return changed ? corrected.join(' ') : null
}

export function searchIndex<T>(index: SearchIndex<T>, query: string): SearchResult<T> {
  const tokens = tokenize(query).map(squeezeRepeats)
  if (tokens.length === 0) {
    return { items: index.items.map((entry) => entry.item), suggestion: null }
  }

  const scored = index.items.map((entry) => {
    const scores = tokens.map((token) => bestMatch(token, entry.words))
    return {
      entry,
      matched: scores.filter((score) => score > 0).length,
      score: scores.reduce((sum, score) => sum + score, 0),
    }
  })

  // Prefer items matching every word; if none do, fall back to those matching the most.
  const mostMatched = Math.max(...scored.map((result) => result.matched))
  const required = scored.some((result) => result.matched === tokens.length)
    ? tokens.length
    : mostMatched

  const items =
    required === 0
      ? []
      : scored
          .filter((result) => result.matched >= required)
          .sort(
            (a, b) =>
              b.score - a.score ||
              a.entry.titleLength - b.entry.titleLength ||
              a.entry.order - b.entry.order,
          )
          .map((result) => result.entry.item)

  return { items, suggestion: suggestQuery(query, index.vocabulary) }
}
