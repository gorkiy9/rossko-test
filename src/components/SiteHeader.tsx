import { Link } from 'react-router-dom'
import { SHOP_PHONE } from '../data'
import { useOrder } from '../store'
import { Icon } from './Icon'
import { Logo } from './Logo'

/** Шапка магазина: каталог, поиск, кабинет. На телефоне — только логотип и иконки */
export function SiteHeader() {
  const o = useOrder()
  const inCart = o.inCart.reduce((n, it) => n + it.qty, 0)
  const inFav = o.all.filter((it) => it.fav).length
  return (
    <header className="r-header">
      <div className="r-header__inner">
        <Link to="/cart" className="r-logo" aria-label="Rossko — на главную">
          <Logo />
        </Link>
        <button type="button" className="r-btn r-btn--soft r-header__catalog">
          <Icon name="menu" size={16} />
          Каталог
        </button>
        <label className="r-header__search">
          <Icon name="search" size={16} />
          <span className="visually-hidden">Поиск по каталогу</span>
          <input type="search" placeholder="Поиск товаров" />
        </label>
        <nav aria-label="Личный кабинет" className="r-header__nav">
          <a href="#" onClick={(e) => e.preventDefault()}>
            <Icon name="package" size={24} />
            <span>Заказы</span>
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label={inFav > 0 ? `Избранное, ${inFav} шт.` : undefined}>
            <span className="r-header__icon">
              <Icon name="heart" size={24} />
              {inFav > 0 && <span className="r-header__badge">{inFav}</span>}
            </span>
            <span>Избранное</span>
          </a>
          <Link to="/cart" className="is-active" aria-label={`Корзина, ${inCart} шт.`}>
            <span className="r-header__icon">
              <Icon name="shopping-cart" size={24} />
              {inCart > 0 && <span className="r-header__badge">{inCart}</span>}
            </span>
            <span>Корзина</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

/** Шапка оформления: без каталога и поиска, чтобы ничего не уводило с оплаты */
export function CheckoutHeader() {
  return (
    <header className="r-header r-header--checkout">
      <div className="r-header__inner">
        <Link to="/cart" className="r-header__back" aria-label="В корзину">
          <Icon name="arrow-left" size={24} />
          <span>В корзину</span>
        </Link>
        <Link to="/cart" className="r-logo" aria-label="Rossko — на главную">
          <Logo />
        </Link>
        {/* На телефоне вместо логотипа и телефона — название шага, как в макете */}
        <span className="r-header__title" aria-hidden="true">
          Оформление
        </span>
        <a href={SHOP_PHONE.href} className="r-header__phone">
          <Icon name="phone" size={16} />
          <span>{SHOP_PHONE.label}</span>
        </a>
      </div>
    </header>
  )
}
