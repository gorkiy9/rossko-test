import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { Page } from '../components/Page'
import { OrderSummary, Panel, Radio } from '../components/ui'
import { PAY_METHODS, capitalize, fmt } from '../data'
import type { CourierId } from '../data'
import { useIsMobile } from '../hooks/useIsMobile'
import { useOrder, useStore } from '../store'

const COURIER_ICON: Record<CourierId, { icon: IconName; tone: string }> = {
  smart: { icon: 'bulb', tone: 'smart' },
  beauty: { icon: 'gift', tone: 'beauty' },
  both: { icon: 'star', tone: 'both' },
}

export function Payment() {
  const o = useOrder()
  const { state, set } = useStore()
  const isMobile = useIsMobile()
  const courier = o.courier
  const look = courier ? COURIER_ICON[courier.id] : COURIER_ICON.smart
  const where = `[Улица, дом], кв. ${state.apt}`
  const cta = {
    to: '/tracking',
    label: `Оплатить ${fmt(o.total)}`,
    mobileLabel: 'Оплатить',
    disabledLabel: courier ? undefined : 'Выберите курьера',
  }

  if (isMobile) {
    const methods = PAY_METHODS.filter((m) => m.mobile)
    return (
      <Page
        title="Оформление заказа"
        step={4}
        back="/courier"
        cta={cta}
        mobileTotal={{ total: fmt(o.total), caption: `Курьер: ${o.feeLabel.toLowerCase()}` }}
      >
        <Panel className="stack-10">
          <span className="eyebrow">Доставка</span>
          <span className="text-15">
            {capitalize(o.slotLabel)} · {where}
          </span>
          {courier && (
            <span className="pay-courier">
              <span className={`courier__icon courier__icon--${look.tone} courier__icon--xs`}>
                <Icon name={look.icon} size={16} />
              </span>
              {courier.prefix} {o.confirmText}
            </span>
          )}
          <Link to="/courier" className="link text-14">
            {courier ? 'Сменить курьера' : 'Выбрать курьера'}
          </Link>
        </Panel>
        <Panel className="stack-10">
          <span className="eyebrow">Способ оплаты</span>
          <div role="radiogroup" aria-label="Способ оплаты" className="stack-10">
            {methods.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={state.pay === m.id}
                className="pay-row"
                onClick={() => set({ pay: m.id })}
              >
                <Radio on={state.pay === m.id} />
                {m.title}
              </button>
            ))}
          </div>
        </Panel>
        <Panel className="stack-8">
          <div className="kv">
            <span>Товары</span>
            <span className="nowrap">{fmt(o.goods)}</span>
          </div>
          <div className="kv">
            <span>{courier ? courier.prefix : 'Курьер'}</span>
            <span className="nowrap">{o.feeLabel}</span>
          </div>
        </Panel>
      </Page>
    )
  }

  return (
    <Page title="Оформление заказа" step={4} cta={cta} aside={<OrderSummary courierRow />}>
      <Panel className="stack-16">
        <h2 className="panel__title">Доставка</h2>
        <div className="choice-row">
          <div className="tile stack-4">
            <span className="tile__eyebrow">Когда и куда</span>
            <span className="tile__title">{capitalize(o.slotLabel)}</span>
            <span className="text-15">{where}</span>
            <Link to="/slot" className="link text-14 mt-4">
              Изменить
            </Link>
          </div>
          <div className="tile tile--row">
            <span className={`courier__icon courier__icon--${look.tone} courier__icon--sm`}>
              <Icon name={look.icon} size={22} />
            </span>
            <span className="stack-4">
              <span className="tile__eyebrow">Курьер</span>
              <span className="tile__title">{courier ? `${courier.title} · ${courier.name}` : 'Не выбран'}</span>
              {courier && <span className="text-15">{o.shortText}</span>}
              <Link to="/courier" className="link text-14 mt-4">
                {courier ? 'Сменить курьера' : 'Выбрать курьера'}
              </Link>
            </span>
          </div>
        </div>
      </Panel>
      <Panel className="stack-16">
        <h2 className="panel__title">Способ оплаты</h2>
        <div className="choice-row" role="radiogroup" aria-label="Способ оплаты">
          {PAY_METHODS.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={state.pay === m.id}
              className={state.pay === m.id ? 'option option--row option--pay is-selected' : 'option option--row option--pay'}
              onClick={() => set({ pay: m.id })}
            >
              <Radio on={state.pay === m.id} />
              <span className="stack-4">
                <span className="option__title">{m.title}</span>
                <span className="option__caption option__caption--sm">{m.caption}</span>
              </span>
            </button>
          ))}
        </div>
      </Panel>
    </Page>
  )
}
