import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { AddressBlock, PickupPoints } from '../components/address'
import type { AddrMode } from '../components/address'
import { ScenarioSwitcher } from '../components/ScenarioSwitcher'
import { Sheet } from '../components/Sheet'
import { SiteHeader } from '../components/SiteHeader'
import { Checkbox, MobileBar, Rows, Segmented, Stepper, Thumb, Total } from '../components/shop'
import { PICKUP_POINTS, PROMO, fmt, pluralGoods, shortStreet } from '../data'
import type { Delivery } from '../store'
import { useOrder, useStore } from '../store'

export function Cart() {
  const o = useOrder()
  const { setQty, toggleItem, toggleAll, removeItems, restoreItem, toggleFav, set, state } = useStore()
  const navigate = useNavigate()
  const [addrOpen, setAddrOpen] = useState(false)
  const [addrMode, setAddrMode] = useState<AddrMode>({ kind: 'list' })

  useEffect(() => {
    document.title = 'Корзина — прототип'
    window.scrollTo(0, 0)
  }, [])

  // Удалённые позиции остаются строкой «Вернуть», пока пользователь на экране
  const visible = o.all
  const checkedCount = o.inCart.filter((it) => it.checked).length
  const allOn = o.inCart.length > 0 && checkedCount === o.inCart.length
  const someOn = checkedCount > 0 && !allOn
  const empty = o.inCart.length === 0
  const canCheckout = o.items.length > 0

  const goCheckout = () => navigate('/checkout')

  // Куда поедет заказ: выбранный адрес или пункт самовывоза — тот же, что предвыбран на оформлении
  const deliverTo = o.isPickup ? PICKUP_POINTS.find((p) => p.id === state.pickup)?.street : o.address.street

  const summaryRows = [
    { label: `Товары, ${o.count} шт.`, value: fmt(o.goodsFull) },
    ...(o.goodsFull > o.goods ? [{ label: 'Скидка', value: '−' + fmt(o.goodsFull - o.goods), tone: 'success' as const }] : []),
    ...(o.promoDiscount ? [{ label: `Промокод ${PROMO.code}`, value: '−' + fmt(o.promoDiscount), tone: 'success' as const }] : []),
    { label: 'Доставка', value: 'при оформлении', tone: 'muted' as const },
  ]

  return (
    <div className="r-app">
      <SiteHeader />
      <main className="r-page">
        <div className="r-page__head r-page__head--sr">
          <h1 className="r-h1">Корзина</h1>
        </div>

        {empty ? (
          <div className="r-card r-empty">
            <Thumb size="lg" icon="shopping-cart" />
            <h2 className="r-empty__title">В корзине пусто</h2>
            <p className="r-empty__text">Добавьте товары из каталога или через поиск — они появятся здесь.</p>
            <button
              type="button"
              className="r-btn r-btn--primary r-btn--md"
              onClick={() => o.all.forEach((it) => restoreItem(it.index))}
            >
              Вернуть удалённые товары
            </button>
          </div>
        ) : (
          <div className="r-grid">
            <div className="r-grid__main">
              <div className="r-card r-cart">
                {deliverTo && (
                  <button
                    type="button"
                    className="r-cart__addr"
                    aria-haspopup="dialog"
                    aria-label={`${o.isPickup ? 'Пункт самовывоза' : 'Адрес доставки'}: ${deliverTo}. Изменить`}
                    onClick={() => {
                      setAddrMode({ kind: 'list' })
                      setAddrOpen(true)
                    }}
                  >
                    <span className="r-cart__addr-text">{shortStreet(deliverTo)}</span>
                    <Icon name="chevron-right" size={24} />
                  </button>
                )}
                <div className="r-cart__toolbar">
                  <Checkbox
                    checked={allOn}
                    indeterminate={someOn}
                    onChange={() => toggleAll(!allOn)}
                    label={checkedCount > 0 ? pluralGoods(checkedCount) : 'Выбрать все'}
                  />
                  <button
                    type="button"
                    className="r-link r-link--danger"
                    disabled={checkedCount === 0}
                    onClick={() => removeItems(o.inCart.filter((it) => it.checked).map((it) => it.index))}
                  >
                    <Icon name="trash" size={16} />
                    Удалить
                  </button>
                </div>

                <ul className="r-cart__list">
                  {visible.map((it) =>
                    it.removed ? (
                      <li key={it.index} className="r-item r-item--removed">
                        <span className="r-item__removed-text">
                          <span className="r-item__removed-name">{it.name}</span> удалён из корзины
                        </span>
                        <button type="button" className="r-link" onClick={() => restoreItem(it.index)}>
                          Вернуть
                        </button>
                      </li>
                    ) : (
                      <li key={it.index} className="r-item">
                        {/* Чекбокс лежит в углу фото */}
                        <div className="r-item__media">
                          <span className="r-item__check">
                            <Checkbox checked={it.checked} onChange={() => toggleItem(it.index)} label={`Выбрать «${it.name}»`} hideLabel />
                          </span>
                          <Thumb size="lg" src={it.image} />
                        </div>
                        <div className="r-item__body">
                          <a href="#" className="r-item__name" onClick={(e) => e.preventDefault()}>
                            {it.name}
                          </a>
                          <div className="r-item__info">
                            <span className="r-item__meta">{it.meta}</span>
                            <span className="r-item__eta">
                              <Icon name="truck" size={16} />
                              {it.eta}
                            </span>
                          </div>
                          <div className="r-item__price">
                            <span className="r-price">{fmt(it.sum)}</span>
                            {it.oldPrice && <s className="r-price-old">{fmt(it.oldSum)}</s>}
                            {it.qty > 1 && <span className="r-item__unit">{fmt(it.price)} за шт.</span>}
                          </div>
                          <div className="r-item__controls">
                            <Stepper
                              value={it.qty}
                              name={it.name}
                              onChange={(v) => setQty(it.index, v)}
                              onRemove={() => removeItems([it.index])}
                            />
                            <div className="r-item__actions">
                              <button
                                type="button"
                                className={it.fav ? 'r-icon-btn is-on' : 'r-icon-btn'}
                                aria-pressed={it.fav}
                                aria-label={it.fav ? 'Убрать из избранного' : 'В избранное'}
                                title={it.fav ? 'Убрать из избранного' : 'В избранное'}
                                onClick={() => toggleFav(it.index)}
                              >
                                <Icon name="heart" size={24} filled={it.fav} />
                              </button>
                              <button
                                type="button"
                                className="r-icon-btn r-item__remove"
                                aria-label={`Удалить «${it.name}»`}
                                title="Удалить"
                                onClick={() => removeItems([it.index])}
                              >
                                <Icon name="trash" size={24} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            <aside className="r-grid__aside" aria-label="Сумма заказа">
              <div className="r-card r-summary">
                <Rows rows={summaryRows} />
                <Total value={o.goods - o.promoDiscount} />
                <button
                  type="button"
                  className="r-btn r-btn--primary r-btn--lg r-desktop-only"
                  disabled={!canCheckout}
                  onClick={goCheckout}
                >
                  {canCheckout ? 'Перейти к оформлению' : 'Выберите товары'}
                </button>
                <p className="r-hint r-desktop-only">Способ и время доставки выберете на следующем шаге</p>
              </div>
              <PromoField applied={state.promo} onApply={() => set({ promo: true })} onReset={() => set({ promo: false })} />
            </aside>
          </div>
        )}
      </main>

      {!empty && (
        <MobileBar total={o.goods - o.promoDiscount} caption={canCheckout ? pluralGoods(o.count) : 'Ничего не выбрано'}>
          <button type="button" className="r-btn r-btn--primary r-btn--md" disabled={!canCheckout} onClick={goCheckout}>
            {canCheckout ? 'К оформлению' : 'Выберите товары'}
          </button>
        </MobileBar>
      )}
      <Sheet
        open={addrOpen}
        onClose={() => setAddrOpen(false)}
        title={o.isPickup ? 'Где забрать заказ' : 'Куда доставить заказ'}
        footer={
          addrMode.kind === 'list' ? (
            <button type="button" className="r-btn r-btn--primary r-btn--lg" onClick={() => setAddrOpen(false)}>
              {o.isPickup ? 'Забрать здесь' : 'Доставить сюда'}
            </button>
          ) : undefined
        }
      >
        <Segmented<Delivery>
          label="Способ получения"
          value={state.delivery}
          onChange={(v) => set({ delivery: v })}
          options={[
            { id: 'courier', title: 'Курьером', caption: 'От 0 ₽, завтра' },
            { id: 'pickup', title: 'Самовывоз', caption: 'Бесплатно' },
          ]}
        />
        {o.isPickup ? <PickupPoints /> : <AddressBlock mode={addrMode} setMode={setAddrMode} />}
      </Sheet>
      <ScenarioSwitcher screen="cart" />
    </div>
  )
}

function PromoField({ applied, onApply, onReset }: { applied: boolean; onApply: () => void; onReset: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Введите промокод')
      return
    }
    if (code.trim().toUpperCase() === PROMO.code) {
      onApply()
      setError('')
    } else {
      setError('Такого промокода нет — проверьте написание')
    }
  }

  if (applied) {
    return (
      <div className="r-card r-promo r-promo--applied">
        <Icon name="tag" size={24} />
        <span className="r-promo__applied">
          <span className="r-promo__code">{PROMO.code}</span>
          <span className="r-promo__desc">Скидка {fmt(PROMO.discount)} применена</span>
        </span>
        <button type="button" className="r-icon-btn" aria-label="Убрать промокод" onClick={onReset}>
          <Icon name="close" size={24} />
        </button>
      </div>
    )
  }

  return (
    <form className="r-card r-promo" onSubmit={submit} noValidate>
      <label htmlFor="promo" className="visually-hidden">
        Промокод
      </label>
      <div className="r-promo__row">
        <input
          id="promo"
          className={error ? 'r-input is-invalid' : 'r-input'}
          placeholder="Промокод"
          autoComplete="off"
          value={code}
          aria-invalid={!!error}
          aria-describedby={error ? 'promo-error' : 'promo-hint'}
          onChange={(e) => {
            setCode(e.target.value)
            if (error) setError('')
          }}
        />
        <button type="submit" className="r-btn r-btn--soft r-btn--md">
          Применить
        </button>
      </div>
      {error ? (
        <p id="promo-error" className="r-field-error" role="alert">
          {error}
        </p>
      ) : (
        <p id="promo-hint" className="r-hint">
          Для проверки: {PROMO.code}
        </p>
      )}
    </form>
  )
}
