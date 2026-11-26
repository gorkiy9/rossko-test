import { PROMO } from './data'
import { freshState } from './store'
import type { ScreenId, State } from './store'

/**
 * Сценарии прототипа — свои на каждом экране.
 * apply строит состояние, match узнаёт сценарий в текущем состоянии (для отметки в меню).
 */
export interface Preset {
  id: string
  label: string
  description: string
  apply: (s: State) => State
  match: (s: State) => boolean
}

const allRemoved = (s: State) => s.removed.every(Boolean)
const someUnchecked = (s: State) => s.checked.some((c, i) => !c && !s.removed[i])
const isPickup = (s: State) => s.delivery === 'pickup'
const pickedCourier = (s: State) => (s.sel !== undefined ? s.sel : s.scenario === 'B' ? '' : s.scenario === 'E' ? 'beauty' : 'smart')

/** Для трекинга и оценки нужен выбранный курьер, даже если на оформлении его не выбрали */
const withCourier = (s: State, sel: 'smart' | 'beauty'): State => ({ ...s, delivery: 'courier', sel })

export const PRESETS: Record<ScreenId, Preset[]> = {
  cart: [
    {
      id: 'full',
      label: 'Техника со скидкой',
      description: 'Кофемашина и кофе, обе позиции выбраны',
      apply: () => freshState('A'),
      match: (s) => s.scenario !== 'B' && !allRemoved(s) && !someUnchecked(s) && !s.promo,
    },
    {
      id: 'simple',
      label: 'Простые товары',
      description: 'Блокнот и ручки, недорогая корзина',
      apply: () => freshState('B'),
      match: (s) => s.scenario === 'B' && !allRemoved(s) && !someUnchecked(s) && !s.promo,
    },
    {
      id: 'unchecked',
      label: 'Не всё в заказ',
      description: 'Одна позиция снята — сумма без неё',
      apply: () => {
        const s = freshState('A')
        return { ...s, checked: s.checked.map((_, i) => i === 0) }
      },
      match: (s) => !allRemoved(s) && someUnchecked(s),
    },
    {
      id: 'promo',
      label: 'С промокодом',
      description: `Применён ${PROMO.code}, скидка в сумме`,
      apply: () => ({ ...freshState('A'), promo: true }),
      match: (s) => s.promo && !allRemoved(s) && !someUnchecked(s),
    },
    {
      id: 'empty',
      label: 'Пустая корзина',
      description: 'Все товары удалены',
      apply: () => {
        const s = freshState('A')
        return { ...s, removed: s.removed.map(() => true) }
      },
      match: allRemoved,
    },
  ],

  checkout: [
    {
      id: 'A',
      label: 'Сложная корзина',
      description: 'Умный курьер предвыбран, бейдж с причиной',
      apply: () => freshState('A'),
      match: (s) => !isPickup(s) && s.scenario === 'A',
    },
    {
      id: 'B',
      label: 'Простая корзина',
      description: 'Без предвыбора — нужно выбрать курьера',
      apply: () => freshState('B'),
      match: (s) => !isPickup(s) && s.scenario === 'B',
    },
    {
      id: 'C',
      label: 'Нет курьера на слот',
      description: 'Красивый занят, предложен ближайший слот',
      apply: () => freshState('C'),
      match: (s) => !isPickup(s) && s.scenario === 'C',
    },
    {
      id: 'D',
      label: 'Повторный заказ',
      description: 'Под умным курьером — прошлый опыт',
      apply: () => freshState('D'),
      match: (s) => !isPickup(s) && s.scenario === 'D',
    },
    {
      id: 'E',
      label: 'Выбран красивый',
      description: 'Предвыбор снят, одна спокойная подсказка',
      apply: () => freshState('E'),
      match: (s) => !isPickup(s) && s.scenario === 'E',
    },
    {
      id: 'pickup',
      label: 'Самовывоз',
      description: 'Без адреса, слота и курьера',
      apply: (s) => ({ ...s, delivery: 'pickup' }),
      match: isPickup,
    },
  ],

  tracking: [
    {
      id: 'courier',
      label: 'Умный курьер',
      description: 'Курьер в пути и что он сделает у двери',
      apply: (s) => ({ ...withCourier(s, 'smart'), otherRecipient: false }),
      match: (s) => !isPickup(s) && pickedCourier(s) !== 'beauty' && !s.otherRecipient,
    },
    {
      id: 'beauty',
      label: 'Красивый курьер',
      description: 'Подарочная упаковка вместо помощи с товаром',
      apply: (s) => ({ ...withCourier(s, 'beauty'), otherRecipient: false }),
      match: (s) => !isPickup(s) && pickedCourier(s) === 'beauty' && !s.otherRecipient,
    },
    {
      id: 'other',
      label: 'Получит другой человек',
      description: 'В деталях — другой получатель',
      apply: (s) => ({
        ...withCourier(s, pickedCourier(s) === 'beauty' ? 'beauty' : 'smart'),
        otherRecipient: true,
        recName: 'Дмитрий Всеволодович Ковалевский-Рыбаков',
        recPhone: '+7 925 610-48-93',
      }),
      match: (s) => !isPickup(s) && s.otherRecipient,
    },
    {
      id: 'pickup',
      label: 'Самовывоз',
      description: 'Код получения и адрес пункта вместо курьера',
      apply: (s) => ({ ...s, delivery: 'pickup' }),
      match: isPickup,
    },
  ],

  rating: [
    {
      id: 'courier',
      label: 'Умный курьер',
      description: 'Вопрос «Курьер помог с товаром?»',
      apply: (s) => ({ ...withCourier(s, 'smart'), rating: 5, helped: 'yes' }),
      match: (s) => !isPickup(s) && pickedCourier(s) !== 'beauty' && s.rating > 3,
    },
    {
      id: 'beauty',
      label: 'Красивый курьер',
      description: 'Вопрос про встречу и упаковку',
      apply: (s) => ({ ...withCourier(s, 'beauty'), rating: 5, helped: 'yes' }),
      match: (s) => !isPickup(s) && pickedCourier(s) === 'beauty' && s.rating > 3,
    },
    {
      id: 'low',
      label: 'Низкая оценка',
      description: 'Две звезды — другой текст и подсказка',
      apply: (s) => ({ ...withCourier(s, pickedCourier(s) === 'beauty' ? 'beauty' : 'smart'), rating: 2, helped: 'no' }),
      match: (s) => !isPickup(s) && s.rating <= 3,
    },
    {
      id: 'pickup',
      label: 'Пункт выдачи',
      description: 'Оценка получения без вопроса о курьере',
      apply: (s) => ({ ...s, delivery: 'pickup', rating: 5 }),
      match: isPickup,
    },
  ],
}

export const SCREEN_TITLES: Record<ScreenId, string> = {
  cart: 'Сценарии корзины',
  checkout: 'Сценарии оформления',
  tracking: 'Сценарии трекинга',
  rating: 'Сценарии оценки',
}
