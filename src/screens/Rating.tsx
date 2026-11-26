import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ScenarioSwitcher } from '../components/ScenarioSwitcher'
import { SiteHeader } from '../components/SiteHeader'
import { COURIERS, ORDER, PICKUP_POINTS } from '../data'
import { useOrder, useStore } from '../store'

const NEXT_TIME = { smart: 'умного курьера', beauty: 'красивого курьера', both: 'курьера «Красивый и умный»' } as const

const LABELS = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично']

export function Rating() {
  const o = useOrder()
  const { state, set } = useStore()
  const [hover, setHover] = useState(0)
  const [sent, setSent] = useState(false)
  const thanksRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    document.title = 'Оценка — прототип'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (sent) thanksRef.current?.focus()
  }, [sent])

  const courier = o.courier ?? COURIERS.smart
  const point = PICKUP_POINTS.find((p) => p.id === state.pickup) ?? PICKUP_POINTS[0]
  const shown = hover || state.rating

  // Вопрос о пользе — главный сигнал для гипотезы про умного курьера
  const question = o.isPickup
    ? null
    : o.picked === 'beauty'
      ? 'Понравилась встреча и упаковка?'
      : 'Курьер помог с товаром?'

  const who = o.isPickup ? (
    <div className="r-rate__who">
      <span className="r-choice__icon r-rate__point">
        <Icon name={point.id === 'p1' ? 'map-pin' : 'store'} size={24} />
      </span>
      <span className="r-courier__who">
        <span className="r-courier__title">{point.title}</span>
        <span className="r-courier__meta">{point.street}</span>
      </span>
    </div>
  ) : (
    <div className="r-rate__who">
      <span aria-hidden="true" className={`r-avatar r-avatar--${o.picked || 'smart'}`}>
        {courier.name[0]}
      </span>
      <span className="r-courier__who">
        <span className="r-courier__title">{courier.name}</span>
        <span className="r-courier__meta">
          {courier.prefix} · заказ № {ORDER.number}
        </span>
      </span>
    </div>
  )

  return (
    <div className="r-app r-app--no-bar">
      <SiteHeader />
      <main className="r-page r-page--narrow">
        {sent ? (
          <section className="r-card r-thanks" aria-live="polite">
            <span className="r-thanks__icon">
              <Icon name="circle-check" size={32} stroke={1.5} />
            </span>
            <h1 ref={thanksRef} tabIndex={-1} className="r-thanks__title">
              Спасибо за оценку
            </h1>
            <p className="r-thanks__text">
              {state.rating <= 3
                ? 'Разберёмся, что пошло не так, и напишем вам, если понадобятся подробности.'
                : o.isPickup
                  ? 'Передадим её пункту выдачи — так мы делаем получение удобнее.'
                  : `В следующий раз предложим ${NEXT_TIME[o.picked || 'smart']} первым, если он подойдёт под заказ.`}
            </p>
            <Link to="/cart" className="r-btn r-btn--primary r-btn--md">
              Вернуться к покупкам
            </Link>
          </section>
        ) : (
          <form
            className="r-card r-rate"
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
          >
            {who}
            <h1 className="r-rate__title">{o.isPickup ? 'Как прошло получение?' : 'Как прошла доставка?'}</h1>

            <div className="r-rate__stars-wrap">
              <div role="radiogroup" aria-label="Оценка" className="r-stars" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-label={`${n} из 5 — ${LABELS[n]}`}
                    aria-checked={state.rating === n}
                    className={n <= shown ? 'r-star is-on' : 'r-star'}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => set({ rating: n })}
                  >
                    <Icon name="star" size={32} stroke={1.5} filled={n <= shown} />
                  </button>
                ))}
              </div>
              <span className="r-rate__label" aria-hidden="true">
                {LABELS[shown]}
              </span>
            </div>

            {question && (
              <fieldset className="r-rate__q">
                <legend className="r-rate__q-title">{question}</legend>
                <div className="r-yesno" role="radiogroup" aria-label={question}>
                  {(['yes', 'no'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={state.helped === v}
                      className={state.helped === v ? 'r-yesno__item is-on' : 'r-yesno__item'}
                      onClick={() => set({ helped: v })}
                    >
                      {v === 'yes' ? 'Да' : 'Нет'}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="r-field">
              <label htmlFor="review" className="r-field__label">
                Отзыв <span className="r-muted">— по желанию</span>
              </label>
              <textarea
                id="review"
                className="r-input r-textarea"
                rows={3}
                placeholder={state.rating <= 3 ? 'Что пошло не так? Разберёмся' : 'Что понравилось'}
                value={state.review}
                onChange={(e) => set({ review: e.target.value })}
              />
            </div>

            <button type="submit" className="r-btn r-btn--primary r-btn--lg">
              Отправить оценку
            </button>
            <p className="r-legal">
              {o.isPickup ? 'Оценку увидит команда пункта выдачи.' : 'Оценка попадёт в отзывы о курьерах и в историю ваших заказов.'}
            </p>
          </form>
        )}
      </main>
      <ScenarioSwitcher screen="rating" onApply={() => setSent(false)} />
    </div>
  )
}
