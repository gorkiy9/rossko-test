import { useState } from 'react'
import type { FormEvent } from 'react'
import { PICKUP_POINTS, addressDetails } from '../data'
import type { Address } from '../data'
import { useOrder, useStore } from '../store'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { RadioDot } from './shop'

/*
 * Выбор адреса и пункта самовывоза. Используется на оформлении (секция «Способ получения»)
 * и в шторке адреса в корзине — одно состояние заказа, одни и те же адреса.
 */

/* ───────── Адрес ───────── */

export type AddrMode = { kind: 'list' } | { kind: 'edit'; id: string } | { kind: 'new' }

const addressIcon = (id: string): IconName => (id === 'home' ? 'house' : id === 'work' ? 'building-office' : 'map-pin')

export function AddressBlock({ mode, setMode, error }: { mode: AddrMode; setMode: (m: AddrMode) => void; error?: string }) {
  const { state, set } = useStore()
  const o = useOrder()

  if (mode.kind !== 'list') {
    const editing = mode.kind === 'edit' ? state.addresses.find((a) => a.id === mode.id) : undefined
    return <AddressForm key={mode.kind === 'edit' ? mode.id : 'new'} initial={editing} error={error} onDone={() => setMode({ kind: 'list' })} />
  }

  const details = addressDetails(o.address)

  return (
    <div className="r-stack-12">
      <div className="r-choices" role="radiogroup" aria-label="Адрес доставки">
        {state.addresses.map((a) => {
          const on = state.address === a.id
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={on}
              className={on ? 'r-choice r-choice--top is-on' : 'r-choice r-choice--top'}
              onClick={() => set({ address: a.id })}
            >
              <span className="r-choice__icon">
                <Icon name={addressIcon(a.id)} size={24} />
              </span>
              <span className="r-choice__text">
                <span className="r-choice__title">{a.title}</span>
                <span className="r-choice__caption">{a.street}</span>
              </span>
              <RadioDot on={on} />
            </button>
          )
        })}
        <button type="button" className="r-choice r-choice--add" onClick={() => setMode({ kind: 'new' })}>
          <span className="r-choice__icon">
            <Icon name="plus" size={24} />
          </span>
          <span className="r-choice__title">Новый адрес</span>
        </button>
      </div>

      <div className="r-inline-row">
        <span className="r-inline-row__text">
          <span className="r-inline-row__main">{details || 'Квартира, подъезд и этаж не указаны'}</span>
          <span className="r-muted">{o.address.comment ? `«${o.address.comment}»` : 'Без комментария курьеру'}</span>
        </span>
        <button
          type="button"
          className="r-link"
          aria-label={`Изменить адрес «${o.address.title}»`}
          onClick={() => setMode({ kind: 'edit', id: o.address.id })}
        >
          <Icon name="pencil" size={16} />
          Изменить
        </button>
      </div>
    </div>
  )
}

const TITLE_PRESETS = ['Дом', 'Работа', 'Дача']

export function AddressForm({ initial, onDone, error }: { initial?: Address; onDone: () => void; error?: string }) {
  const { state, saveAddress, removeAddress } = useStore()
  const isNew = !initial
  const [draft, setDraft] = useState<Address>(
    () =>
      initial ?? {
        id: `addr-${Date.now()}`,
        title: '',
        street: '',
        apt: '',
        entrance: '',
        floor: '',
        intercom: '',
        comment: '',
      },
  )
  const [touched, setTouched] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const patch = (p: Partial<Address>) => setDraft((d) => ({ ...d, ...p }))

  const streetError = !draft.street.trim()
    ? 'Укажите город, улицу и дом'
    : !/\d/.test(draft.street)
      ? 'Добавьте номер дома'
      : undefined

  const save = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (streetError) {
      document.getElementById('addr-street')?.focus()
      return
    }
    saveAddress({ ...draft, title: draft.title.trim() || 'Адрес', street: draft.street.trim() })
    onDone()
  }

  const canDelete = !isNew && state.addresses.length > 1

  return (
    <form className="r-addr-form" onSubmit={save} noValidate aria-label={isNew ? 'Новый адрес' : `Изменение адреса «${initial.title}»`}>
      <div className="r-addr-form__head">
        <h3 className="r-addr-form__title">{isNew ? 'Новый адрес' : `Адрес «${initial.title}»`}</h3>
        {error && (
          <p className="r-field-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="r-field">
        <span className="r-field__label" id="addr-title-label">
          Название
        </span>
        <div className="r-addr-form__title-row">
          <div className="r-chips" role="group" aria-labelledby="addr-title-label">
            {TITLE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={draft.title === t}
                className={draft.title === t ? 'r-chip is-on' : 'r-chip'}
                onClick={() => patch({ title: t })}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            className="r-input"
            aria-labelledby="addr-title-label"
            placeholder="Или своё"
            value={TITLE_PRESETS.includes(draft.title) ? '' : draft.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </div>
      </div>

      <Input
        id="addr-street"
        label="Город, улица и дом"
        placeholder="Москва, Тверская улица, д. 7"
        autoComplete="street-address"
        value={draft.street}
        error={touched ? streetError : undefined}
        onBlur={() => setTouched(true)}
        onChange={(v) => patch({ street: v })}
      />

      <div className="r-addr-fields">
        <Input id="addr-apt" label="Квартира или офис" value={draft.apt} onChange={(v) => patch({ apt: v })} />
        <Input id="addr-entrance" label="Подъезд" inputMode="numeric" value={draft.entrance} onChange={(v) => patch({ entrance: v })} />
        <Input id="addr-floor" label="Этаж" inputMode="numeric" value={draft.floor} onChange={(v) => patch({ floor: v })} />
        <Input id="addr-intercom" label="Домофон" value={draft.intercom} onChange={(v) => patch({ intercom: v })} />
      </div>

      <Input
        id="addr-comment"
        label="Комментарий курьеру"
        placeholder="Например, позвонить за 30 минут"
        value={draft.comment}
        onChange={(v) => patch({ comment: v })}
      />

      <div className="r-addr-form__actions">
        <button type="submit" className="r-btn r-btn--primary r-btn--md">
          {isNew ? 'Добавить адрес' : 'Сохранить'}
        </button>
        <button type="button" className="r-btn r-btn--soft r-btn--md" onClick={onDone}>
          Отменить
        </button>
        {canDelete &&
          (confirmDelete ? (
            <span className="r-addr-form__confirm" role="group" aria-label="Подтверждение удаления">
              <span>Удалить «{initial.title}»?</span>
              <button
                type="button"
                className="r-link r-link--danger is-strong"
                onClick={() => {
                  removeAddress(initial.id)
                  onDone()
                }}
              >
                Удалить
              </button>
              <button type="button" className="r-link" onClick={() => setConfirmDelete(false)}>
                Оставить
              </button>
            </span>
          ) : (
            <button type="button" className="r-link r-link--danger r-addr-form__delete" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={16} />
              Удалить адрес
            </button>
          ))}
      </div>
    </form>
  )
}

export function PickupPoints() {
  const { state, set } = useStore()
  return (
    <div className="r-choices r-choices--list" role="radiogroup" aria-label="Пункт самовывоза">
      {PICKUP_POINTS.map((p) => {
        const on = state.pickup === p.id
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={on ? 'r-choice is-on' : 'r-choice'}
            onClick={() => set({ pickup: p.id })}
          >
            <span className="r-choice__icon">
              <Icon name={p.id === 'p1' ? 'map-pin' : 'store'} size={24} />
            </span>
            <span className="r-choice__text">
              <span className="r-choice__title">{p.title}</span>
              <span className="r-choice__caption">{p.street}</span>
              <span className="r-choice__caption">{p.hours}</span>
              <span className="r-choice__meta">{p.when}</span>
            </span>
            <RadioDot on={on} />
          </button>
        )
      })}
    </div>
  )
}


export function Input({
  id,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  onFocus?: () => void
  error?: string
  placeholder?: string
  type?: string
  inputMode?: 'numeric' | 'tel' | 'text'
  autoComplete?: string
}) {
  return (
    <div className="r-field">
      <label htmlFor={id} className="r-field__label">
        {label}
      </label>
      <input
        id={id}
        className={error ? 'r-input is-invalid' : 'r-input'}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id={`${id}-error`} className="r-field-error">
          {error}
        </p>
      )}
    </div>
  )
}
