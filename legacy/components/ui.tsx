import type { ReactNode } from 'react'
import { fmt } from '../data'
import { useOrder } from '../store'
import { Icon } from './Icon'

/** Серая плашка-контейнер */
export function Panel({ children, className = '', as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' }) {
  return <Tag className={`panel ${className}`}>{children}</Tag>
}

export function Radio({ on }: { on: boolean }) {
  return <span aria-hidden="true" className={on ? 'radio radio--on' : 'radio'} />
}

export function CheckList({ items, color = 'var(--muted)' }: { items: string[]; color?: string }) {
  return (
    <span className="check-list">
      {items.map((t) => (
        <span key={t} className="check-list__item">
          <Icon name="check" size={16} stroke={2} color={color} className="check-list__icon" />
          {t}
        </span>
      ))}
    </span>
  )
}

export function Status({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="status">
      <Icon name="check" size={16} stroke={2} />
      {children}
    </p>
  )
}

export function Field({
  id,
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} rows={3} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}

/** Правая колонка десктопа: товары, строки сумм, итог */
export function OrderSummary({
  showItems = true,
  courierRow,
  plainGoods,
}: {
  showItems?: boolean
  courierRow?: boolean
  plainGoods?: boolean
}) {
  const o = useOrder()
  return (
    <div className="panel summary">
      {showItems &&
        o.items.map((it) => (
          <div key={it.name} className="summary__item">
            <span aria-hidden="true" className="thumb thumb--sm" />
            <span className="summary__name">
              {it.name}
              {it.qty > 1 && <span className="muted"> × {it.qty}</span>}
            </span>
            <span className="nowrap">{fmt(it.sum)}</span>
          </div>
        ))}
      <div className={showItems ? 'summary__rows summary__rows--divided' : 'summary__rows'}>
        <div className="summary__row">
          <span>{plainGoods ? 'Товары' : `Товары, ${o.count} шт.`}</span>
          <span>{fmt(o.goods)}</span>
        </div>
        {courierRow ? (
          <div className="summary__row">
            <span>Курьер</span>
            <span>{o.feeLabel}</span>
          </div>
        ) : (
          <div className="summary__row">
            <span>Доставка</span>
            <span className="muted">на шаге «Курьер»</span>
          </div>
        )}
      </div>
      <div className="summary__total">
        <span className="summary__total-label">Итого</span>
        <span className="summary__total-value">{fmt(courierRow ? o.total : o.goods)}</span>
      </div>
    </div>
  )
}
