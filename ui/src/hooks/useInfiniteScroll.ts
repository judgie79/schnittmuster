import { useEffect, useRef } from 'react'

interface Options {
  enabled?: boolean
  onLoadMore: () => void
}

export const useInfiniteScroll = ({ enabled = true, onLoadMore }: Options) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      })
    })

    const sentinel = sentinelRef.current
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
      observer.disconnect()
    }
  }, [enabled, onLoadMore])

  return { sentinelRef }
}
