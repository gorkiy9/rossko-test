import type { CSSProperties } from 'react'
import { ICONS } from './icons.generated'

/** Старые имена экранов трекинга и оценки → иконки coolicons */
const ALIASES = {
  back: 'arrow-left',
  box: 'package',
  bag: 'shopping-cart',
  info: 'circle-info',
  sliders: 'filter',
} as const

export type IconName = keyof typeof ICONS | keyof typeof ALIASES

interface Props {
  name: IconName
  size?: number
  /** Толщина линии на сетке 24 — у coolicons 2 */
  stroke?: number
  filled?: boolean
  color?: string
  style?: CSSProperties
  className?: string
}

export function Icon({ name, size = 24, stroke = 2, filled, color, style, className }: Props) {
  const key = (name in ALIASES ? ALIASES[name as keyof typeof ALIASES] : name) as keyof typeof ICONS
  const icon = ICONS[key]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      <g
        transform={`translate(${icon.t[0]} ${icon.t[1]})`}
        fill={filled ? (color ?? 'currentColor') : 'none'}
        stroke={color ?? 'currentColor'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon.d.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  )
}
