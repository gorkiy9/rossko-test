import { useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ScenarioSwitcher } from '../components/ScenarioSwitcher'
import { SiteHeader } from '../components/SiteHeader'
import { MobileBar, Rows, Thumb, Total } from '../components/shop'
import { COURIERS, addressDetails, CUSTOMER, SHOP_PHONE, DAYS, ORDER, PAY_METHODS, PICKUP_POINTS, PROMO, SLOTS, capitalize, fmt, pluralGoods } from '../data'
import { useOrder, useStore } from '../store'

type StepState = 'done' | 'current' | 'todo'

export function Tracking() {
  const o = useOrder()
  const { state } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Заказ № ${ORDER.number} — прототип`
    window.scrollTo(0, 0)
  }, [])

  if (o.items.length === 0) return <Navigate to="/cart" replace />

  const courier = o.courier ?? COURIERS.smart
  const services = o.courierServices.length ? o.courierServices : o.scenario.services
  const point = PICKUP_POINTS.find((p) => p.id === state.pickup) ?? PICKUP_POINTS[0]
  const pay = PAY_METHODS.find((m) => m.id === state.pay) ?? PAY_METHODS[0]
  const paid = state.pay !== 'cash'
  const pickupDay = point.when.split(',')[0]

  const steps: { title: string; when: string; state: StepState }[] = o.isPickup
    ? [
        { title: paid ? 'Оплачен' : 'Оформлен', when: 'Сегодня, 21:14', state: 'done' },
        { title: 'Собран на складе', when: 'Сегодня, 23:40', state: 'done' },
        { title: 'Едет в пункт выдачи', when: 'Сейчас', state: 'current' },
        { title: 'Можно забрать', when: `${pickupDay}, с 10:00`, state: 'todo' },
      ]
    : [
        { title: paid ? 'Оплачен' : 'Оформлен', when: 'Сегодня, 21:14', state: 'done' },
        { title: 'Собран на складе', when: 'Сегодня, 23:40', state: 'done' },
        { title: 'Передан курьеру', when: `${DAYS[state.day][0]}, около ${leaveTime(state.slot)}`, state: 'current' },
        { title: 'Доставлен', when: capitalize(o.slotLabel), state: 'todo' },
      ]

  const headline = o.isPickup ? `Можно забрать ${pickupDay.toLowerCase()} с 10:00` : `Приедет ${o.slotLabel}`
  const totalCaption = paid ? 'Оплачено' : 'К оплате при получении'

  return (
    <div className="r-app">
      <SiteHeader />
      <main className="r-page">
        <div className="r-page__head r-track-head">
          <span className="r-track-head__ok">
            <Icon name="circle-check" size={16} />
            Заказ оформлен
          </span>
          <h1 className="r-h1">Заказ № {ORDER.number}</h1>
        </div>

        <div className="r-grid">
          <div className="r-grid__main r-stack">
            <section className="r-card r-track" aria-labelledby="track-title">
              <span className="r-pill">{o.isPickup ? 'Едет в пункт выдачи' : 'В пути'}</span>
              <h2 id="track-title" className="r-track__title">
                {headline}
              </h2>
              <ol className="r-progress">
                {steps.map((s) => (
                  <li key={s.title} className={`r-progress__step is-${s.state}`} aria-current={s.state === 'current' ? 'step' : undefined}>
                    <span className="r-progress__dot" aria-hidden="true">
                      {s.state === 'done' && <Icon name="check" size={16} />}
                    </span>
                    <span className="r-progress__text">
                      <span className="r-progress__title">{s.title}</span>
                      <span className="r-progress__when">{s.when}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {o.isPickup ? (
              <section className="r-card r-section" aria-labelledby="pickup-title">
                <div className="r-section__head">
                  <h2 id="pickup-title" className="r-section__title">
                    Где забрать
                  </h2>
                </div>
                <div className="r-pickup">
                  <div className="r-person">
                    <span className="r-choice__icon">
                      <Icon name={point.id === 'p1' ? 'map-pin' : 'store'} size={24} />
                    </span>
                    <span className="r-choice__text">
                      <span className="r-choice__title">{point.title}</span>
                      <span className="r-choice__caption">{point.street}</span>
                      <span className="r-choice__caption">{point.hours}</span>
                    </span>
                  </div>
                  <div className="r-code">
                    <span className="r-code__label">Код получения</span>
                    <span className="r-code__value">{ORDER.pickupCode}</span>
                    <span className="r-code__hint">Покажите его сотруднику пункта. Заказ хранится 7 дней</span>
                  </div>
                </div>
              </section>
            ) : (
              <section className="r-card r-section" aria-labelledby="courier-title">
                <div className="r-section__head">
                  <h2 id="courier-title" className="r-section__title">
                    Ваш курьер
                  </h2>
                </div>
                <div className="r-stack-12">
                  <div className="r-courier-card">
                    <span aria-hidden="true" className={`r-avatar r-avatar--${o.picked || 'smart'}`}>
                      {courier.name[0]}
                    </span>
                    <span className="r-courier__who">
                      <span className="r-courier__title">{courier.name}</span>
                      <span className="r-courier__meta">
                        {courier.prefix} · <Icon name="star" size={16} filled color="var(--color-star)" /> {courier.rating} ·{' '}
                        {courier.deliveries} доставок
                      </span>
                    </span>
                    <a href={SHOP_PHONE.href} className="r-btn r-btn--soft r-btn--md r-courier-card__call">
                      <Icon name="phone" size={16} />
                      <span>Позвонить</span>
                    </a>
                  </div>
                  <div className="r-todo">
                    <span className="r-todo__title">Что сделает курьер</span>
                    <ul className="r-checklist">
                      {services.map((s) => (
                        <li key={s}>
                          <Icon name="check" size={16} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="r-hint">Курьер позвонит за 30 минут до приезда</p>
                </div>
              </section>
            )}

            <section className="r-card r-section" aria-labelledby="details-title">
              <div className="r-section__head">
                <h2 id="details-title" className="r-section__title">
                  Детали заказа
                </h2>
              </div>
              <dl className="r-details">
                <div>
                  <dt>{o.isPickup ? 'Самовывоз' : `Адрес · ${o.address.title}`}</dt>
                  <dd>
                    {o.isPickup
                      ? `${point.title}, ${point.street}`
                      : [o.address.street, addressDetails(o.address)].filter(Boolean).join(', ')}
                  </dd>
                </div>
                {!o.isPickup && o.address.comment && (
                  <div>
                    <dt>Комментарий курьеру</dt>
                    <dd>{o.address.comment}</dd>
                  </div>
                )}
                <div>
                  <dt>Получатель</dt>
                  <dd>
                    {state.otherRecipient && state.recName
                      ? `${state.recName}, ${state.recPhone}`
                      : `${CUSTOMER.name}, ${CUSTOMER.phone}`}
                  </dd>
                </div>
                <div>
                  <dt>Оплата</dt>
                  <dd>
                    {pay.title}
                    {paid ? ' · оплачено' : ''}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <aside className="r-grid__aside" aria-label="Состав заказа">
            <div className="r-card r-summary">
              <h2 className="r-section__title">{pluralGoods(o.count)}</h2>
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
              <Rows
                rows={[
                  { label: `Товары, ${o.count} шт.`, value: fmt(o.goodsFull) },
                  ...(o.discount ? [{ label: 'Скидка', value: '−' + fmt(o.discount), tone: 'success' as const }] : []),
                  ...(o.promoDiscount ? [{ label: `В том числе ${PROMO.code}`, value: '−' + fmt(o.promoDiscount), tone: 'muted' as const }] : []),
                  o.isPickup
                    ? { label: 'Самовывоз', value: 'Бесплатно' }
                    : { label: `Курьер «${courier.title}»`, value: o.feeLabel },
                ]}
              />
              <Total value={o.total} caption={totalCaption} />
              <button type="button" className="r-btn r-btn--primary r-btn--lg r-desktop-only" onClick={() => navigate('/rating')}>
                Заказ получен
              </button>
              <p className="r-legal r-desktop-only">Демо: кнопка имитирует доставку и открывает оценку</p>
            </div>
            <Link to="/cart" className="r-link r-track__back">
              <Icon name="arrow-left" size={16} />
              Вернуться к покупкам
            </Link>
          </aside>
        </div>
      </main>

      <MobileBar total={o.total} caption={paid ? 'Оплачено' : 'Оплата на месте'}>
        <button type="button" className="r-btn r-btn--primary r-btn--md" onClick={() => navigate('/rating')}>
          Заказ получен
        </button>
      </MobileBar>
      <ScenarioSwitcher screen="tracking" />
    </div>
  )
}

/** «19:00–21:00» → «18:00»: курьер выезжает примерно за час до начала слота */
function leaveTime(slot: number) {
  const start = parseInt(SLOTS[slot], 10)
  return `${String(start - 1).padStart(2, '0')}:00`
}
