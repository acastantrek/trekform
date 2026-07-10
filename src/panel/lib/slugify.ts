const accentMap: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  ñ: 'n',
  Á: 'a',
  É: 'e',
  Í: 'i',
  Ó: 'o',
  Ú: 'u',
  Ü: 'u',
  Ñ: 'n',
}

export function slugify(value: string): string {
  const withoutAccents = value
    .split('')
    .map((char) => accentMap[char] ?? char)
    .join('')

  return withoutAccents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
