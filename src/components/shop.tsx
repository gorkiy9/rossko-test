import type { CSSProperties, ReactNode } from 'react'
import { fmt } from '../data'
import { Icon } from './Icon'
import type { IconName } from './Icon'

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  hideLabel,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (v: boolean) => void
  label: string
  hideLabel?: boolean
}) {
  return (
    <label className="r-check">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = !!indeterminate
        }}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="r-check__box" aria-hidden="true">
        {indeterminate ? <Icon name="minus" size={16} /> : <Icon name="check" size={16} />}
      </span>
      <span className={hideLabel ? 'visually-hidden' : 'r-check__label'}>{label}</span>
    </label>
  )
}

/** Количество. «Минус» на единице убирает товар из корзины (onRemove), а не блокируется */
export function Stepper({
  value,
  onChange,
  onRemove,
  name,
}: {
  value: number
  onChange: (v: number) => void
  onRemove: () => void
  name: string
}) {
  const last = value <= 1
  return (
    <div className="r-stepper" role="group" aria-label={`Количество: ${name}`}>
      <button
        type="button"
        aria-label={last ? `Удалить «${name}» из корзины` : 'Уменьшить'}
        title={last ? 'Удалить из корзины' : undefined}
        onClick={() => (last ? onRemove() : onChange(value - 1))}
      >
        <Icon name="minus" size={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label="Увеличить" disabled={value >= 99} onClick={() => onChange(value + 1)}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

/** Сегментированный переключатель. Подложка едет под выбранный вариант */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T
  options: { id: T; title: string; caption?: string }[]
  onChange: (v: T) => void
  label: string
  /** Модификатор раскладки, например r-seg--inline для шапки */
  className?: string
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.id === value),
  )
  return (
    <div
      className={className ? `r-seg ${className}` : 'r-seg'}
      role="radiogroup"
      aria-label={label}
      style={{ '--seg-n': options.length, '--seg-i': index } as CSSProperties}
    >
      <span className="r-seg__thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          className="r-seg__item"
          onClick={() => onChange(o.id)}
        >
          <span className="r-seg__title">{o.title}</span>
          {o.caption && <span className="r-seg__caption">{o.caption}</span>}
        </button>
      ))}
    </div>
  )
}

export function RadioDot({ on }: { on: boolean }) {
  return <span aria-hidden="true" className={on ? 'r-radio is-on' : 'r-radio'} />
}

export function Thumb({ size = 'md', icon = 'package', src }: { size?: 'sm' | 'md' | 'lg'; icon?: IconName; src?: string }) {
  if (src) {
    return (
      <span aria-hidden="true" className={`r-thumb r-thumb--${size} r-thumb--img`}>
        <img src={src} alt="" loading="lazy" decoding="async" />
      </span>
    )
  }
  return (
    <span aria-hidden="true" className={`r-thumb r-thumb--${size}`}>
      <Icon name={icon} size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} stroke={size === 'lg' ? 1.5 : 2} />
    </span>
  )
}

export function Section({
  id,
  title,
  aside,
  children,
  invalid,
}: {
  id?: string
  title: string
  aside?: ReactNode
  children: ReactNode
  invalid?: boolean
}) {
  return (
    <section id={id} className={invalid ? 'r-card r-section is-invalid' : 'r-card r-section'} aria-labelledby={id && `${id}-title`}>
      <div className="r-section__head">
        <h2 id={id && `${id}-title`} className="r-section__title">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Rows({ rows }: { rows: { label: ReactNode; value: ReactNode; tone?: 'success' | 'muted' }[] }) {
  return (
    <dl className="r-rows">
      {rows.map((r, i) => (
        <div key={i} className="r-rows__row">
          <dt>{r.label}</dt>
          <dd className={r.tone ? `is-${r.tone}` : undefined}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Total({ value, caption }: { value: number; caption?: string }) {
  return (
    <div className="r-total">
      <span className="r-total__label">Итого</span>
      <span className="r-total__value">{fmt(value)}</span>
      {caption && <span className="r-total__caption">{caption}</span>}
    </div>
  )
}

/** Нижняя панель на телефоне: сумма + главное действие */
export function MobileBar({ total, caption, children }: { total: number; caption: string; children: ReactNode }) {
  return (
    <div className="r-mbar">
      <span className="r-mbar__sum">
        <span className="r-mbar__total">{fmt(total)}</span>
        <span className="r-mbar__caption">{caption}</span>
      </span>
      {children}
    </div>
  )
}
