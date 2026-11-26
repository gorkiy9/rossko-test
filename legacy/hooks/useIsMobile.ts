import { useSyncExternalStore } from 'react'

const QUERY = '(max-width: 767px)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** Мобильная раскладка — до 767px, как артборды 390px в дизайне */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches)
}
