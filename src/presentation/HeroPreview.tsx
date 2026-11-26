import { useState } from 'react'
import { COURIERS, BEAUTY_SERVICES, SCENARIOS, fmt } from '../data'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { RadioDot, Section } from '../components/shop'

/** Подтверждение для красивого — тот же текст, что в useOrder() прототипа */
const BEAUTY_CONFIRM = 'Марк привезёт заказ в подарочной упаковке'

/**
 * Блок «Кто привезёт заказ» в сценарии A — живой фрагмент прототипа на первом экране.
 * Те же классы и данные, что на оформлении: выбор переключается в один клик, без модалок.
 */
export function HeroPreview() {
  const sc = SCENARIOS.A
  const [picked, setPicked] = useState<'smart' | 'beauty'>('smart')

  const card = (id: 'smart' | 'beauty', icon: IconName, services: string[], reco?: boolean) => {
    const c = COURIERS[id]
    const on = picked === id
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        className={on ? 'r-courier is-on' : 'r-courier'}
        onClick={() => setPicked(id)}
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
          <RadioDot on={on} />
        </span>
        {reco && (
          <span className="r-courier__reco">
            <span className="r-badge">Рекомендуем для вашего заказа</span>
            <span className="r-courier__reason">{sc.reason}</span>
          </span>
        )}
        <ul className="r-checklist">
          {services.map((s) => (
            <li key={s}>
              <Icon name="check" size={16} />
              {s}
            </li>
          ))}
        </ul>
        <span className={c.fee ? 'r-courier__price' : 'r-courier__price is-free'}>
          {c.fee ? '+' + fmt(c.fee) : 'Бесплатно'}
        </span>
      </button>
    )
  }

  return (
    <Section title="Кто привезёт заказ">
      <div className="r-stack-12">
        <div className="r-couriers" role="radiogroup" aria-label="Тип курьера">
          <div className="r-couriers__col">{card('smart', 'bulb', sc.services, true)}</div>
          <div className="r-couriers__col">{card('beauty', 'gift', BEAUTY_SERVICES)}</div>
        </div>
        {/* Невидимый двойник самого высокого исхода держит высоту: текст слева от блока не прыгает */}
        <div className="p-swap">
          <div className="r-stack-12">
            <p className="r-status" role="status">
              <Icon name="circle-check" size={16} />
              Отлично, {picked === 'smart' ? sc.confirm : BEAUTY_CONFIRM}
            </p>
            {picked === 'beauty' && <p className="r-hint">{sc.hint}</p>}
          </div>
          <div className="r-stack-12 p-swap__ghost" aria-hidden="true">
            <p className="r-status">
              <Icon name="circle-check" size={16} />
              Отлично, {sc.confirm.length > BEAUTY_CONFIRM.length ? sc.confirm : BEAUTY_CONFIRM}
            </p>
            <p className="r-hint">{sc.hint}</p>
          </div>
        </div>
      </div>
    </Section>
  )
}
