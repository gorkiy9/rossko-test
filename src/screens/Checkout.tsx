import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { ScenarioSwitcher } from '../components/ScenarioSwitcher'
import { CheckoutHeader } from '../components/SiteHeader'
import { AddressBlock, Input, PickupPoints } from '../components/address'
import type { AddrMode } from '../components/address'
import { MobileBar, RadioDot, Rows, Section, Segmented, Thumb, Total } from '../components/shop'
import {
  BEAUTY_NEAREST_SLOT,
  CUSTOMER,
  COURIERS,
  DAYS,
  PAST_SLOTS_TODAY,
  PAY_METHODS,
  PICKUP_POINTS,
  PROMO,
  SLOTS,
  capitalize,
  fmt,
  pluralGoods,
} from '../data'
import type { CourierId } from '../data'
import type { Delivery } from '../store'
import { useOrder, useStore } from '../store'

type ErrorKey = 'address' | 'courier' | 'recName' | 'recPhone'

const PHONE_PREFIX = '+7 '

/** Маска «+7 900 123-45-67»: +7 ставится сам, 8 и 7 в начале вставленного номера отбрасываются */
function formatPhone(raw: string) {
  const all = raw.replace(/\D/g, '')
  let d = all
  if (raw.trimStart().startsWith('+7')) d = all.slice(1)
  // вставили «8 925…» или «+7 925…» поверх уже стоящего +7
  if (d.length === 11 && /^[78]/.test(d)) d = d.slice(1)
  d = d.slice(0, 10)
  let out = PHONE_PREFIX + d.slice(0, 3)
  if (d.length > 3) out += ' ' + d.slice(3, 6)
  if (d.length > 6) out += '-' + d.slice(6, 8)
  if (d.length > 8) out += '-' + d.slice(8, 10)
  return out
}
const phoneComplete = (v: string) => v.replace(/\D/g, '').length === 11

export function Checkout() {
  const o = useOrder()
  const { state, set } = useStore()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<ErrorKey, boolean>>>({})
  const [addrMode, setAddrMode] = useState<AddrMode>({ kind: 'list' })

  useEffect(() => {
    document.title = 'Оформление заказа — прототип'
    window.scrollTo(0, 0)
  }, [])

  if (o.items.length === 0) return <Navigate to="/cart" replace />

  const errors: Partial<Record<ErrorKey, string>> = {}
  if (!o.isPickup && addrMode.kind !== 'list') errors.address = 'Сохраните адрес или отмените изменения'
  if (!o.isPickup && !o.picked) errors.courier = 'Выберите, кто привезёт заказ'
  if (state.otherRecipient && !state.recName.trim()) errors.recName = 'Напишите имя получателя'
  if (state.otherRecipient && !phoneComplete(state.recPhone)) errors.recPhone = 'Введите номер полностью'
  const shown = (k: ErrorKey) => (submitted || touched[k] ? errors[k] : undefined)

  const payLabel = state.pay === 'cash' ? 'Подтвердить заказ' : `Оплатить ${fmt(o.total)}`

  const submit = () => {
    setSubmitted(true)
    const first = (['address', 'courier', 'recName', 'recPhone'] as ErrorKey[]).find((k) => errors[k])
    if (!first) {
      navigate('/tracking')
      return
    }
    const targetId = first === 'address' ? 'delivery' : first
    const target = document.getElementById(targetId)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: first === 'address' ? 'start' : 'center' })
    if (first === 'recName' || first === 'recPhone') (target as HTMLInputElement | null)?.focus({ preventScroll: true })
  }

  const whenLabel = o.isPickup
    ? `Самовывоз, ${PICKUP_POINTS.find((p) => p.id === state.pickup)?.when.split(',')[0].toLowerCase()}`
    : `Курьером, ${o.slotLabel}`

  return (
    <div className="r-app">
      <CheckoutHeader />
      <main className="r-page">
        <div className="r-page__head r-page__head--sr">
          <h1 className="r-h1">Оформление заказа</h1>
        </div>

        <div className="r-grid">
          <div className="r-grid__main r-stack">
            <Section id="delivery" title="Способ получения" invalid={!!shown('address')}>
              <Segmented<Delivery>
                label="Способ получения"
                value={state.delivery}
                onChange={(v) => set({ delivery: v })}
                options={[
                  { id: 'courier', title: 'Курьером', caption: 'От 0 ₽, завтра' },
                  { id: 'pickup', title: 'Самовывоз', caption: 'Бесплатно' },
                ]}
              />
              {o.isPickup ? (
                <PickupPoints />
              ) : (
                <AddressBlock
                  mode={addrMode}
                  error={shown('address')}
                  setMode={setAddrMode}
                />
              )}
            </Section>

            {!o.isPickup && (
              <Section id="slot" title="Дата и время доставки">
                <SlotPicker />
              </Section>
            )}

            {!o.isPickup && (
              <Section id="courier" title="Кто привезёт заказ" invalid={!!shown('courier')}>
                {shown('courier') && (
                  <p className="r-field-error r-section__error" role="alert">
                    {errors.courier}
                  </p>
                )}
                <CourierChoice />
              </Section>
            )}

            <Section id="recipient" title="Получатель">
              <Recipient
                errors={{ recName: shown('recName'), recPhone: shown('recPhone') }}
                onBlur={(k) => setTouched((t) => ({ ...t, [k]: true }))}
              />
            </Section>

            <Section id="payment" title="Способ оплаты">
              <PayMethods />
            </Section>
          </div>

          <aside className="r-grid__aside" aria-label="Ваш заказ">
            <div className="r-card r-summary">
              <div className="r-summary__head">
                <h2 className="r-section__title">Ваш заказ</h2>
                <Link to="/cart" className="r-link">
                  Изменить
                </Link>
              </div>
              <ul className="r-summary__items">
                {o.items.map((it) => (
                  <li key={it.index}>
                    <Thumb size="sm" src={it.image} />
                    <span className="r-summary__name">
                      {it.name}
                      {it.qty > 1 && <span className="r-muted"> × {it.qty}</span>}
                    </span>
                    <span className="r-nowrap">{fmt(it.sum)}</span>
                  </li>
                ))}
              </ul>
              <div className="r-summary__when">
                <Icon name={o.isPickup ? 'store' : 'truck'} size={16} />
                <span className="r-summary__when-text">
                  <span>{whenLabel}</span>
                  <span className="r-summary__when-addr">
                    {o.isPickup ? PICKUP_POINTS.find((p) => p.id === state.pickup)?.street : o.address.street}
                  </span>
                </span>
              </div>
              <Rows
                rows={[
                  { label: `Товары, ${o.count} шт.`, value: fmt(o.goodsFull) },
                  ...(o.goodsFull > o.goods
                    ? [{ label: 'Скидка', value: '−' + fmt(o.goodsFull - o.goods), tone: 'success' as const }]
                    : []),
                  ...(o.promoDiscount
                    ? [{ label: `Промокод ${PROMO.code}`, value: '−' + fmt(o.promoDiscount), tone: 'success' as const }]
                    : []),
                  o.isPickup
                    ? { label: 'Самовывоз', value: 'Бесплатно' }
                    : {
                        label: o.courier ? `Курьер «${o.courier.title}»` : 'Курьер',
                        value: o.courier ? o.feeLabel : 'не выбран',
                        tone: o.courier ? undefined : ('muted' as const),
                      },
                ]}
              />
              <Total value={o.total} />
              <button type="button" className="r-btn r-btn--primary r-btn--lg r-desktop-only" onClick={submit}>
                {payLabel}
              </button>
              <p className="r-legal">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  условиями продажи
                </a>{' '}
                и обработкой персональных данных
              </p>
            </div>
          </aside>
        </div>
      </main>

      <MobileBar total={o.total} caption={pluralGoods(o.count)}>
        <button type="button" className="r-btn r-btn--primary r-btn--md" onClick={submit}>
          {state.pay === 'cash' ? 'Подтвердить' : 'Оплатить'}
        </button>
      </MobileBar>
      <ScenarioSwitcher
        screen="checkout"
        onApply={() => {
          setSubmitted(false)
          setTouched({})
          setAddrMode({ kind: 'list' })
        }}
      />
    </div>
  )
}

/* ───────── Слот ───────── */

function SlotPicker() {
  const { state, set } = useStore()
  const o = useOrder()
  return (
    <div className="r-stack-12">
      <div className="r-days" role="radiogroup" aria-label="День доставки">
        {DAYS.map(([day, date], i) => {
          const on = state.day === i
          return (
            <button
              key={day}
              type="button"
              role="radio"
              aria-checked={on}
              className={on ? 'r-day is-on' : 'r-day'}
              onClick={() => {
                const firstFree = i === 0 ? Math.max(state.slot, PAST_SLOTS_TODAY) : state.slot
                set({ day: i, slot: firstFree })
              }}
            >
              <span className="r-day__name">{day}</span>
              <span className="r-day__date">{date}</span>
            </button>
          )
        })}
      </div>
      <div className="r-slots" role="radiogroup" aria-label="Время доставки">
        {SLOTS.map((slot, i) => {
          const past = state.day === 0 && i < PAST_SLOTS_TODAY
          const on = state.slot === i && !past
          const beautyHere =
            !!o.scenario.slotOverride && state.day === BEAUTY_NEAREST_SLOT.day && i === BEAUTY_NEAREST_SLOT.slot
          return (
            <button
              key={slot}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={past}
              className={on ? 'r-slot is-on' : 'r-slot'}
              onClick={() => set({ slot: i })}
            >
              {slot}
              {beautyHere && <span className="r-slot__dot" title="Есть все типы курьеров" />}
            </button>
          )
        })}
      </div>
      {state.day === 0 && <p className="r-hint">Утренние слоты на сегодня уже заняты</p>}
    </div>
  )
}

/* ───────── Курьер ───────── */

function CourierChoice() {
  const o = useOrder()
  const { pickCourier, moveToBeautySlot } = useStore()
  const sc = o.scenario
  const on = (id: CourierId) => o.picked === id

  const card = (id: 'smart' | 'beauty', icon: IconName, services: string[], extra?: ReactNode) => {
    const c = COURIERS[id]
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on(id)}
        className={on(id) ? 'r-courier is-on' : 'r-courier'}
        onClick={() => pickCourier(id)}
      >
        <span className="r-courier__head">
          <span className={`r-courier__icon r-courier__icon--${id}`}>
            <Icon name={icon} size={24} />
          </span>
          <span className="r-courier__who">
            <span className="r-courier__title">{c.title}</span>
            <span className="r-courier__meta">
              {c.name} · <Icon name="star" size={16} filled color="var(--color-star)" /> {c.rating}
            </span>
          </span>
          <RadioDot on={on(id)} />
        </span>
        {extra}
        <ul className="r-checklist">
          {services.map((s) => (
            <li key={s}>
              <Icon name="check" size={16} />
              {s}
            </li>
          ))}
        </ul>
        <span className={c.fee ? 'r-courier__price' : 'r-courier__price is-free'}>{c.fee ? '+' + fmt(c.fee) : 'Бесплатно'}</span>
      </button>
    )
  }

  const recommendation = sc.reason ? (
    <span className="r-courier__reco">
      <span className="r-badge">Рекомендуем для вашего заказа</span>
      <span className="r-courier__reason">{sc.reason}</span>
    </span>
  ) : null

  const nearest = `${DAYS[BEAUTY_NEAREST_SLOT.day][0].toLowerCase()}, ${SLOTS[BEAUTY_NEAREST_SLOT.slot]}`

  return (
    <div className="r-stack-12">
      <div className="r-couriers" role="radiogroup" aria-label="Тип курьера">
        <div className="r-couriers__col">
          {card('smart', 'bulb', sc.services, recommendation)}
          {sc.note && (
            <p className="r-courier-note">
              <Icon name="clock" size={16} />
              {sc.note}
            </p>
          )}
        </div>
        <div className="r-couriers__col">
          {o.beautyAvailable ? (
            card('beauty', 'gift', ['Приятная встреча у двери', 'Подарочная упаковка', 'Фото на память'])
          ) : (
            <div className="r-courier is-disabled">
              <span className="r-courier__head">
                <span className="r-courier__icon">
                  <Icon name="gift" size={24} />
                </span>
                <span className="r-courier__who">
                  <span className="r-courier__title">{COURIERS.beauty.title}</span>
                  <span className="r-courier__meta">Нет свободных на это время</span>
                </span>
              </span>
              <p className="r-courier__off">Ближайший свободный слот: {nearest}</p>
              <button type="button" className="r-btn r-btn--soft r-btn--sm" onClick={moveToBeautySlot}>
                Выбрать этот слот
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        role="radio"
        aria-checked={on('both')}
        className={on('both') ? 'r-courier r-courier--row is-on' : 'r-courier r-courier--row'}
        onClick={() => pickCourier('both')}
      >
        <span className="r-courier__icon r-courier__icon--both">
          <Icon name="star" size={24} />
        </span>
        <span className="r-courier__who">
          <span className="r-courier__title">{COURIERS.both.title}</span>
          <span className="r-courier__meta">
            {COURIERS.both.name} · <Icon name="star" size={16} filled color="var(--color-star)" /> {COURIERS.both.rating} · всё
            сразу, не на все слоты
          </span>
        </span>
        <span className="r-courier__price">+{fmt(COURIERS.both.fee)}</span>
        <RadioDot on={on('both')} />
      </button>

      {o.picked && (
        <p className="r-status" role="status">
          <Icon name="circle-check" size={16} />
          Отлично, {o.confirmText}
        </p>
      )}
      {o.picked === 'beauty' && sc.hint && <p className="r-hint">{sc.hint}</p>}
    </div>
  )
}

/* ───────── Получатель ───────── */

function Recipient({
  errors,
  onBlur,
}: {
  errors: { recName?: string; recPhone?: string }
  onBlur: (k: 'recName' | 'recPhone') => void
}) {
  const { state, set } = useStore()
  return (
    <div className="r-stack-12">
      <div className="r-person">
        <span className="r-choice__icon">
          <Icon name="user" size={24} />
        </span>
        <span className="r-choice__text">
          <span className="r-choice__title">{CUSTOMER.name}</span>
          <span className="r-choice__caption">{CUSTOMER.phone}</span>
          <span className="r-choice__caption">{CUSTOMER.email}</span>
        </span>
      </div>
      <label className="r-switch">
        <input
          type="checkbox"
          role="switch"
          checked={state.otherRecipient}
          onChange={(e) => set({ otherRecipient: e.target.checked })}
        />
        <span className="r-switch__track" aria-hidden="true">
          <span className="r-switch__thumb" />
        </span>
        Получит другой человек
      </label>
      {state.otherRecipient && (
        <div className="r-two">
          <Input
            id="recName"
            label="Имя получателя"
            value={state.recName}
            autoComplete="name"
            error={errors.recName}
            onBlur={() => onBlur('recName')}
            onChange={(v) => set({ recName: v })}
          />
          <Input
            id="recPhone"
            label="Телефон"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 900 123-45-67"
            value={state.recPhone}
            error={errors.recPhone}
            onFocus={() => {
              if (!state.recPhone) set({ recPhone: PHONE_PREFIX })
            }}
            onBlur={() => {
              if (state.recPhone.trim() === PHONE_PREFIX.trim()) set({ recPhone: '' })
              onBlur('recPhone')
            }}
            onChange={(v) => set({ recPhone: formatPhone(v) })}
          />
        </div>
      )}
    </div>
  )
}

/* ───────── Оплата ───────── */

function PayMethods() {
  const { state, set } = useStore()
  return (
    <div className="r-pay" role="radiogroup" aria-label="Способ оплаты">
      {PAY_METHODS.map((m) => {
        const on = state.pay === m.id
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={on ? 'r-pay__item is-on' : 'r-pay__item'}
            onClick={() => set({ pay: m.id })}
          >
            <span className="r-pay__top">
              <Icon name={m.icon} size={24} />
              <RadioDot on={on} />
            </span>
            <span className="r-pay__title">{m.title}</span>
            <span className="r-pay__caption">{capitalize(m.caption)}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ───────── Поле ───────── */
