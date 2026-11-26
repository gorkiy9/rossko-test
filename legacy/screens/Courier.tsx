import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Page } from '../components/Page'
import { ScenarioSwitcher } from '../components/ScenarioSwitcher'
import { CheckList, OrderSummary, Panel, Radio, Status } from '../components/ui'
import { BEAUTY_SERVICES, COURIERS, fmt } from '../data'
import type { CourierId } from '../data'
import { useIsMobile } from '../hooks/useIsMobile'
import { useOrder, useStore } from '../store'

const NEAREST_BEAUTY_SLOT = 'завтра, 14:00–16:00'

export function Courier() {
  const o = useOrder()
  const { state, pickCourier, moveToBeautySlot } = useStore()
  const isMobile = useIsMobile()
  const sc = o.scenario
  const on = (id: CourierId) => o.picked === id
  const pressProps = (id: CourierId) => ({
    'aria-pressed': on(id),
    onClick: () => pickCourier(id),
  })
  const cardClass = (id: CourierId, extra = '') => `option courier ${extra} ${on(id) ? 'is-selected' : ''}`

  const recommendation = sc.reason && (
    <span className="stack-6">
      <span className="badge">Рекомендуем для вашего заказа</span>
      <span className="courier__reason">{sc.reason}</span>
    </span>
  )

  const smartHead = (
    <span className="courier__head">
      <span className="courier__icon courier__icon--smart">
        <Icon name="bulb" size={isMobile ? 20 : 24} />
      </span>
      <span className="courier__who">
        <span className="courier__title">{COURIERS.smart.title}</span>
        <span className="courier__meta">
          {COURIERS.smart.name} · ★ {COURIERS.smart.rating}
        </span>
      </span>
      {isMobile && <span className="courier__fee courier__fee--free">Бесплатно</span>}
      <Radio on={on('smart')} />
    </span>
  )

  const beautyHead = (
    <span className="courier__head">
      <span className="courier__icon courier__icon--beauty">
        <Icon name="gift" size={isMobile ? 20 : 24} />
      </span>
      <span className="courier__who">
        <span className="courier__title">{COURIERS.beauty.title}</span>
        <span className="courier__meta">
          {COURIERS.beauty.name} · ★ {COURIERS.beauty.rating}
        </span>
      </span>
      {isMobile && <span className="courier__fee">+{fmt(COURIERS.beauty.fee)}</span>}
      <Radio on={on('beauty')} />
    </span>
  )

  const beautyOff = (
    <div className="courier-off">
      <span className="courier__head">
        <span className="courier__icon courier__icon--off">
          <Icon name="gift" size={isMobile ? 20 : 24} />
        </span>
        <span className="courier__who">
          <span className="courier__title muted">{COURIERS.beauty.title}</span>
          <span className="courier__meta">Нет свободных на это время</span>
        </span>
      </span>
      <p className="courier-off__text">Ближайший слот: {NEAREST_BEAUTY_SLOT}</p>
      <button className="btn btn--ghost" onClick={moveToBeautySlot}>
        Выбрать этот слот
      </button>
    </div>
  )

  const both = (
    <button className={cardClass('both', 'courier--both')} {...pressProps('both')}>
      <span className="courier__icon courier__icon--both">
        <Icon name="star" size={isMobile ? 16 : 20} />
      </span>
      <span className="courier__who">
        <span className="courier__title">{COURIERS.both.title}</span>
        <span className="courier__meta">
          {COURIERS.both.name} · ★ {COURIERS.both.rating} · {isMobile ? 'доступно не на все слоты' : 'всё сразу, доступно не на все слоты'}
        </span>
      </span>
      <span className="courier__fee">+{fmt(COURIERS.both.fee)}</span>
      <Radio on={on('both')} />
    </button>
  )

  const feedback = (
    <>
      {o.picked && <Status>Отлично, {o.confirmText}</Status>}
      {o.picked === 'beauty' && sc.hint && <p className="note">{sc.hint}</p>}
    </>
  )

  const slotStrip = (
    <Panel className="slot-strip">
      {!isMobile && (
        <span className="slot-strip__icon">
          <Icon name="clock" size={22} />
        </span>
      )}
      <span className="slot-strip__text">
        <span className="slot-strip__title">Курьером, {o.slotLabel}</span>
        <span className="slot-strip__addr">[Улица, дом], кв. {state.apt}</span>
      </span>
      <Link to="/slot" className="link">
        Изменить
      </Link>
    </Panel>
  )

  if (isMobile) {
    return (
      <Page
        title="Оформление заказа"
        step={3}
        back="/slot"
        cta={{ to: '/payment', label: 'Перейти к оплате', disabledLabel: o.picked ? undefined : 'Выберите курьера' }}
        mobileTotal={{ total: fmt(o.total), caption: `Курьер: ${o.feeLabel}` }}
      >
        {slotStrip}
        <Panel className="courier-panel">
          <h1 className="courier-panel__title">Кто привезёт ваш заказ?</h1>
          <button className={cardClass('smart')} {...pressProps('smart')}>
            {smartHead}
            {recommendation}
            <CheckList items={sc.services} />
          </button>
          {sc.note && <p className="courier-note">{sc.note}</p>}
          {o.beautyAvailable ? (
            <button className={cardClass('beauty')} {...pressProps('beauty')}>
              {beautyHead}
              <span className="courier__line">Приятная встреча у двери, подарочная упаковка, фото на память</span>
            </button>
          ) : (
            beautyOff
          )}
          {both}
        </Panel>
        {feedback}
        <ScenarioSwitcher />
      </Page>
    )
  }

  return (
    <Page
      title="Оформление заказа"
      step={3}
      cta={{ to: '/payment', label: 'Перейти к оплате', disabledLabel: o.picked ? undefined : 'Выберите курьера' }}
      aside={
        <>
          <OrderSummary courierRow plainGoods />
          <div className="panel info-strip">
            <Icon name="info" size={20} />
            Курьера можно сменить до передачи заказа в доставку
          </div>
        </>
      }
    >
      {slotStrip}
      <Panel className="courier-panel">
        <h2 className="panel__title">Кто привезёт ваш заказ?</h2>
        <div className="courier-pair">
          <div className="courier-pair__col">
            <button className={cardClass('smart', 'courier--big')} {...pressProps('smart')}>
              {smartHead}
              {recommendation}
              <CheckList items={sc.services} />
              <span className="courier__price courier__price--free">Бесплатно</span>
            </button>
            {sc.note && <p className="courier-note">{sc.note}</p>}
          </div>
          <div className="courier-pair__col">
            {o.beautyAvailable ? (
              <button className={cardClass('beauty', 'courier--big')} {...pressProps('beauty')}>
                {beautyHead}
                <CheckList items={BEAUTY_SERVICES} />
                <span className="courier__price">+{fmt(COURIERS.beauty.fee)}</span>
              </button>
            ) : (
              beautyOff
            )}
          </div>
        </div>
        {both}
        {feedback}
      </Panel>
      <ScenarioSwitcher />
    </Page>
  )
}
