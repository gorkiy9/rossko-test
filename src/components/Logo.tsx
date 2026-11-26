/** Знак: буква R в скруглённом квадрате акцентного цвета. Тот же рисунок — в public/favicon.svg */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="r-logo__mark">
      <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
      <path
        d="M11 24V8h6.25a4.5 4.5 0 0 1 0 9H11m5.5 0L22 24"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo() {
  return (
    <>
      <LogoMark />
      <span className="r-logo__word">rossko</span>
    </>
  )
}
