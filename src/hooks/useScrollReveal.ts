import { useEffect } from 'react'

/**
 * Reveals `[data-reveal]` elements as they scroll into view. Also watches for
 * elements added after mount (e.g. cards rendered once an async fetch
 * resolves) via MutationObserver, since those would otherwise never be
 * picked up by a one-off DOM scan and would stay invisible forever.
 */
export function useScrollReveal() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (media.matches) {
      const revealAll = () =>
        document.querySelectorAll('[data-reveal]').forEach((element) => {
          element.classList.add('is-visible')
        })
      revealAll()
      const mutationObserver = new MutationObserver(revealAll)
      mutationObserver.observe(document.body, { childList: true, subtree: true })
      return () => mutationObserver.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    const observeNew = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => {
        observer.observe(element)
      })
    }

    observeNew(document)

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches('[data-reveal]')) observer.observe(node)
          observeNew(node)
        })
      })
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])
}
