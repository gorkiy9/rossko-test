import coffeeBeans from './assets/products/coffee-beans.webp'
import coffeeMachine from './assets/products/coffee-machine.jpg'
import gelPens from './assets/products/gel-pens.jpg'
import notebookA5 from './assets/products/notebook-a5.webp'

export type ScenarioId = 'A' | 'B' | 'C' | 'D' | 'E'
export type CourierId = 'smart' | 'beauty' | 'both'

export interface Item {
  name: string
  price: number
  /** Цена до скидки */
  oldPrice?: number
  /** Артикул и вес — строка под названием */
  meta: string
  /** Когда привезём курьером — строка в корзине */
  eta: string
  /** Фото товара; без него — нейтральная заглушка */
  image?: string
}

export interface Scenario {
  id: ScenarioId
  label: string
  description: string
  items: Item[]
  /** Курьер, выбранный по умолчанию ('' — без предвыбора) */
  def: CourierId | ''
  /** Причина рекомендации умного курьера ('' — без бейджа) */
  reason: string
  services: string[]
  /** Что сделает умный курьер (для статуса подтверждения) */
  confirm: string
  /** Коротко — для карточки курьера на оплате */
  short: string
  /** Спокойная подсказка при выборе красивого */
  hint: string
  /** Заметка про прошлый опыт под карточкой умного */
  note?: string
  /** Сценарий C: красивый свободен только на BEAUTY_NEAREST_SLOT, стартуем с этого слота */
  slotOverride?: string
}

const coffee: Omit<Scenario, 'id' | 'label' | 'description'> = {
  items: [
    { name: 'Кофемашина рожковая', price: 34990, oldPrice: 39990, meta: 'Арт. 4410-218 · 8,4 кг', eta: 'Курьером завтра', image: coffeeMachine },
    { name: 'Кофе в зёрнах, 1 кг', price: 1290, meta: 'Арт. 1032-077 · 1 кг', eta: 'Курьером завтра', image: coffeeBeans },
  ],
  def: 'smart',
  reason: 'В заказе кофемашина — курьер подключит её и покажет первый капучино',
  services: [
    'Подключит кофемашину и проверит работу',
    'Покажет, как приготовить первый капучино',
    'Проверит товар при вас',
  ],
  confirm: 'Алексей подключит кофемашину',
  short: 'Подключит кофемашину',
  hint: 'С подключением поможет инструкция в коробке',
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  A: { id: 'A', label: 'Сложная корзина', description: 'Умный предвыбран, бейдж с причиной', ...coffee },
  B: {
    id: 'B',
    label: 'Простая корзина',
    description: 'Без предвыбора и бейджа',
    items: [
      { name: 'Блокнот А5', price: 390, meta: 'Арт. 2201-015 · 0,3 кг', eta: 'Курьером завтра', image: notebookA5 },
      { name: 'Набор гелевых ручек', price: 250, oldPrice: 320, meta: 'Арт. 2207-410 · 0,1 кг', eta: 'Курьером завтра', image: gelPens },
    ],
    def: '',
    reason: '',
    services: ['Проверит товар при вас', 'Ответит на вопросы о заказе', 'Сразу оформит возврат, если нужно'],
    confirm: 'Алексей проверит заказ при вас',
    short: 'Проверит заказ при вас',
    hint: '',
  },
  C: {
    id: 'C',
    label: 'Нет курьера на слот',
    description: 'Красивый недоступен, предложен ближайший слот',
    ...coffee,
    slotOverride: 'сегодня, 19:00–21:00',
  },
  D: {
    id: 'D',
    label: 'Повторный заказ',
    description: 'Под карточкой — прошлый опыт с умным',
    items: [{ name: 'Кроссовки беговые', price: 6490, oldPrice: 7990, meta: 'Арт. 7781-302 · размер 42', eta: 'Курьером завтра' }],
    def: 'smart',
    reason: 'В заказе обувь — курьер подождёт, пока вы примерите',
    services: ['Подождёт примерку', 'Сразу заберёт то, что не подошло', 'Проверит товар при вас'],
    note: 'В прошлый раз курьер настроил вам телевизор',
    confirm: 'Алексей подождёт примерку',
    short: 'Подождёт примерку',
    hint: 'Вернуть неподошедшее можно в пункте выдачи',
  },
  E: { id: 'E', label: 'Выбран красивый', description: 'Предвыбор снят, одна спокойная подсказка', ...coffee, def: 'beauty' },
}

export const SCENARIO_IDS = Object.keys(SCENARIOS) as ScenarioId[]

export interface Courier {
  id: CourierId
  title: string
  name: string
  rating: string
  deliveries: string
  fee: number
  /** Подпись в платёжном блоке: «Умный курьер Алексей …» */
  prefix: string
}

export const COURIERS: Record<CourierId, Courier> = {
  smart: { id: 'smart', title: 'Умный', name: 'Алексей', rating: '4,9', deliveries: '1 240', fee: 0, prefix: 'Умный курьер' },
  beauty: { id: 'beauty', title: 'Красивый', name: 'Марк', rating: '4,8', deliveries: '860', fee: 199, prefix: 'Красивый курьер' },
  both: { id: 'both', title: 'Красивый и умный', name: 'Ника', rating: '5,0', deliveries: '410', fee: 499, prefix: 'Курьер «Красивый и умный»' },
}

export const BEAUTY_SERVICES = ['Приятная встреча у двери', 'Подарочная упаковка', 'Фото на память']

export const BEAUTY_NEAREST_SLOT = { day: 1, slot: 2 }

export const DAYS: [string, string][] = [
  ['Сегодня', '26 ноября'],
  ['Завтра', '27 ноября'],
  ['Пятница', '28 ноября'],
  ['Суббота', '29 ноября'],
]

export const SLOTS = ['10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00', '19:00–21:00', '21:00–23:00']

export interface Address {
  id: string
  /** Как покупатель называет адрес: «Дом», «Работа», «Дача» */
  title: string
  street: string
  apt: string
  entrance: string
  floor: string
  intercom: string
  comment: string
}

/** Сохранённые адреса покупателя. У каждого — свои квартира, подъезд и комментарий */
export const ADDRESSES: Address[] = [
  {
    id: 'home',
    title: 'Дом',
    street: 'Москва, улица Академика Константина Скрябина, д. 23, корп. 2',
    apt: '148',
    entrance: '3',
    floor: '11',
    intercom: '148В',
    comment: '',
  },
  {
    id: 'work',
    title: 'Работа',
    street: 'Москва, Пресненская набережная, д. 12, башня «Восток», офис 4108',
    apt: '',
    entrance: '2',
    floor: '41',
    intercom: '',
    comment: 'Пропуск заказан на ресепшене, позвоните за 15 минут',
  },
]

/**
 * Улица и дом без города и корпуса, с почтовыми сокращениями:
 * «Москва, улица …, д. 23, корп. 2» → «ул. …, д. 23».
 * Если номера дома нет (адрес введён вручную), отбрасывается только город.
 */
export function shortStreet(street: string) {
  const parts = street.split(',').map((x) => x.trim()).filter(Boolean)
  const rest = parts.length > 1 ? parts.slice(1) : parts
  const house = rest.findIndex((x) => /^д\.\s*\S/.test(x))
  return (house > 0 ? rest.slice(0, house + 1) : rest)
    .join(', ')
    .replace(/(^|\s)улица(?=\s|,|$)/, '$1ул.')
    .replace(/(^|\s)проспект(?=\s|,|$)/, '$1просп.')
    .replace(/(^|\s)набережная(?=\s|,|$)/, '$1наб.')
    .replace(/(^|\s)шоссе(?=\s|,|$)/, '$1ш.')
}

/** «кв. 148 · подъезд 3 · этаж 11 · домофон 148В» */
export function addressDetails(a: Address) {
  return [
    a.apt && `кв. ${a.apt}`,
    a.entrance && `подъезд ${a.entrance}`,
    a.floor && `этаж ${a.floor}`,
    a.intercom && `домофон ${a.intercom}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

export const PAY_METHODS = [
  { id: 'card', title: 'Картой онлайн', caption: 'Мир •• 4417', mobile: true, icon: 'credit-card' },
  { id: 'sbp', title: 'СБП', caption: 'Через приложение банка', mobile: false, icon: 'phone' },
  { id: 'cash', title: 'При получении', caption: 'Картой или наличными', mobile: true, icon: 'wallet' },
] as const

/** Пункты самовывоза — моки */
export const PICKUP_POINTS = [
  { id: 'p1', title: 'Пункт выдачи', street: 'Москва, проспект Маршала Жукова, д. 41, корп. 1, стр. 3', hours: 'Ежедневно 9:00–21:00', when: 'Завтра, бесплатно' },
  { id: 'p2', title: 'Магазин', street: 'Москва, Ленинградское шоссе, д. 112, корп. 4, стр. 1', hours: 'Ежедневно 10:00–22:00', when: 'Послезавтра, бесплатно' },
] as const

export type PickupId = (typeof PICKUP_POINTS)[number]['id']

/** Недоступные слоты сегодня — время уже прошло */
export const PAST_SLOTS_TODAY = 4

/** Покупатель и магазин — вымышленные данные с длинными значениями, чтобы проверить переносы */
export const CUSTOMER = {
  name: 'Александра Преображенская-Белозерская',
  phone: '+7 916 482-37-15',
  email: 'alexandra.preobrazhenskaya-belozerskaya@yandex.ru',
}

export const SHOP_PHONE = { label: '8 800 301-46-92', href: 'tel:88003014692' }

/** Оформленный заказ — моки */
export const ORDER = { number: '4821-0937', pickupCode: '4821' }

/** Промокод прототипа */
export const PROMO = { code: 'ROSSKO', discount: 500 }

export type PayMethodId = (typeof PAY_METHODS)[number]['id']

export const fmt = (n: number) => n.toLocaleString('ru-RU') + ' ₽'

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function pluralGoods(n: number) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return `${n} товар`
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} товара`
  return `${n} товаров`
}
