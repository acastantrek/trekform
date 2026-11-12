// Cookie consent stored in the visitor's browser. Technical cookies are always
// allowed; analytics/marketing scripts must check `hasConsent()` (or listen to
// CONSENT_CHANGE_EVENT) before loading.

export type ConsentCategory = 'analytics' | 'marketing'

export interface CookieConsent {
  version: number
  date: string
  analytics: boolean
  marketing: boolean
}

// Bump when the categories or the cookies in use change, so visitors are asked again.
const CONSENT_VERSION = 1
const STORAGE_KEY = 'trekform-cookie-consent'
// AEPD guidance: ask again after 24 months at most.
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365 * 2

export const CONSENT_CHANGE_EVENT = 'trekform:cookie-consent-change'
export const OPEN_SETTINGS_EVENT = 'trekform:open-cookie-settings'

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const consent = JSON.parse(raw) as CookieConsent
    if (consent.version !== CONSENT_VERSION) return null
    if (Date.now() - new Date(consent.date).getTime() > MAX_AGE_MS) return null
    return consent
  } catch {
    return null
  }
}

export function saveCookieConsent(choice: Pick<CookieConsent, ConsentCategory>): CookieConsent {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
    analytics: choice.analytics,
    marketing: choice.marketing,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  } catch {
    // Storage blocked (private mode, etc.): the choice still applies for this visit.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: consent }))
  return consent
}

export function hasConsent(category: ConsentCategory): boolean {
  return getCookieConsent()?.[category] ?? false
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))
}
