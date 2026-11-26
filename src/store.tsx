import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ADDRESSES, BEAUTY_NEAREST_SLOT, BEAUTY_SERVICES, COURIERS, DAYS, PROMO, SCENARIOS, SCENARIO_IDS, SLOTS, fmt } from './data'
import type { Address, CourierId, PayMethodId, PickupId, ScenarioId } from './data'

export type Delivery = 'courier' | 'pickup'

/** Экраны, у которых есть свой набор сценариев прототипа */
export type ScreenId = 'cart' | 'checkout' | 'tracking' | 'rating'

export interface State {
  scenario: ScenarioId
  /** undefined — курьер ещё не трогали, берём предвыбор сценария */
  sel?: CourierId | ''
  /** Перешли на ближайший слот, где есть красивый курьер (сценарий C) */
  moved: boolean
  qty: number[]
  /** Галочки в корзине: в заказ идут только отмеченные */
  checked: boolean[]
  /** Удалённые из корзины — держим, чтобы можно было вернуть */
  removed: boolean[]
  fav: boolean[]
  promo: boolean
  delivery: Delivery
  pickup: PickupId
  day: number
  slot: number
  addresses: Address[]
  /** id выбранного адреса */
  address: string
  otherRecipient: boolean
  recName: string
  recPhone: string
  pay: PayMethodId
  rating: number
  helped: 'yes' | 'no'
  review: string
}

const STORAGE_KEY = 'rossko-checkout-v4'

function scenarioFromUrl(): ScenarioId | undefined {
  const query = window.location.hash.split('?')[1] ?? window.location.search.slice(1)
  const s = new URLSearchParams(query).get('s')?.toUpperCase()
  return SCENARIO_IDS.find((id) => id === s)
}

export function freshState(scenario: ScenarioId): State {
  const n = SCENARIOS[scenario].items.length
  const isC = !!SCENARIOS[scenario].slotOverride
  return {
    scenario,
    sel: undefined,
    moved: false,
    qty: Array(n).fill(1),
    checked: Array(n).fill(true),
    removed: Array(n).fill(false),
    fav: Array(n).fill(false),
    promo: false,
    delivery: 'courier',
    pickup: 'p1',
    day: isC ? 0 : 1,
    slot: 4,
    addresses: ADDRESSES.map((a) => ({ ...a })),
    address: ADDRESSES[0].id,
    otherRecipient: false,
    recName: '',
    recPhone: '',
    pay: 'card',
    rating: 5,
    helped: 'yes',
    review: '',
  }
}

function initialState(): State {
  const fromUrl = scenarioFromUrl()
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as State
      if (!fromUrl || fromUrl === parsed.scenario) return { ...freshState(parsed.scenario), ...parsed }
    }
  } catch {
    /* повреждённое сохранение — начинаем заново */
  }
  return freshState(fromUrl ?? 'A')
}

interface Store {
  state: State
  set: (patch: Partial<State>) => void
  setScenario: (id: ScenarioId) => void
  pickCourier: (id: CourierId) => void
  moveToBeautySlot: () => void
  setQty: (index: number, qty: number) => void
  toggleItem: (index: number) => void
  toggleAll: (on: boolean) => void
  removeItems: (indexes: number[]) => void
  restoreItem: (index: number) => void
  toggleFav: (index: number) => void
  /** Сохраняет новый или изменённый адрес и сразу выбирает его */
  saveAddress: (a: Address) => void
  removeAddress: (id: string) => void
  /** Применяет сценарий: получает текущее состояние, возвращает новое */
  update: (fn: (s: State) => State) => void
  /** Всё с начала: исходная корзина, пустые формы */
  resetAll: () => void
}

const Ctx = createContext<Store | null>(null)

const patchAt = <T,>(arr: T[], indexes: number[], value: T) => arr.map((v, i) => (indexes.includes(i) ? value : v))

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* приватный режим — живём без сохранения */
    }
  }, [state])

  const store = useMemo<Store>(
    () => ({
      state,
      set: (patch) => setState((s) => ({ ...s, ...patch })),
      setScenario: (id) => setState(() => freshState(id)),
      pickCourier: (id) => setState((s) => ({ ...s, sel: id })),
      moveToBeautySlot: () =>
        setState((s) => ({ ...s, sel: 'beauty', moved: true, day: BEAUTY_NEAREST_SLOT.day, slot: BEAUTY_NEAREST_SLOT.slot })),
      setQty: (index, qty) =>
        setState((s) => ({ ...s, qty: s.qty.map((q, i) => (i === index ? Math.max(1, Math.min(99, qty)) : q)) })),
      toggleItem: (index) => setState((s) => ({ ...s, checked: s.checked.map((c, i) => (i === index ? !c : c)) })),
      toggleAll: (on) => setState((s) => ({ ...s, checked: s.checked.map(() => on) })),
      removeItems: (indexes) => setState((s) => ({ ...s, removed: patchAt(s.removed, indexes, true) })),
      restoreItem: (index) =>
        setState((s) => ({ ...s, removed: patchAt(s.removed, [index], false), checked: patchAt(s.checked, [index], true) })),
      toggleFav: (index) => setState((s) => ({ ...s, fav: s.fav.map((f, i) => (i === index ? !f : f)) })),
      saveAddress: (a) =>
        setState((s) => ({
          ...s,
          addresses: s.addresses.some((x) => x.id === a.id)
            ? s.addresses.map((x) => (x.id === a.id ? a : x))
            : [...s.addresses, a],
          address: a.id,
        })),
      update: (fn) => setState(fn),
      resetAll: () => setState(() => freshState('A')),
      removeAddress: (id) =>
        setState((s) => {
          const addresses = s.addresses.filter((x) => x.id !== id)
          if (addresses.length === 0) return s
          return { ...s, addresses, address: s.address === id ? addresses[0].id : s.address }
        }),
    }),
    [state],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore() {
  const store = useContext(Ctx)
  if (!store) throw new Error('useStore вне StoreProvider')
  return store
}

/** Всё производное от состояния: товары, суммы, слот, выбранный курьер */
export function useOrder() {
  const { state } = useStore()
  const scenario = SCENARIOS[state.scenario]
  const all = scenario.items.map((it, i) => {
    const qty = state.qty[i] ?? 1
    return {
      ...it,
      index: i,
      qty,
      sum: it.price * qty,
      oldSum: (it.oldPrice ?? it.price) * qty,
      checked: state.checked[i] ?? true,
      removed: state.removed[i] ?? false,
      fav: state.fav[i] ?? false,
    }
  })
  /** Позиции, которые видны в корзине */
  const inCart = all.filter((it) => !it.removed)
  /** Позиции, которые идут в заказ */
  const items = inCart.filter((it) => it.checked)
  const count = items.reduce((n, it) => n + it.qty, 0)
  const goods = items.reduce((n, it) => n + it.sum, 0)
  const goodsFull = items.reduce((n, it) => n + it.oldSum, 0)
  const promoDiscount = state.promo && goods > 0 ? Math.min(PROMO.discount, goods) : 0
  const discount = goodsFull - goods + promoDiscount

  const isPickup = state.delivery === 'pickup'
  const address = state.addresses.find((a) => a.id === state.address) ?? state.addresses[0]
  const picked: CourierId | '' = state.sel !== undefined ? state.sel : scenario.def
  const courier = picked ? COURIERS[picked] : undefined
  const fee = isPickup ? 0 : (courier?.fee ?? 0)
  const beautyAvailable =
    !scenario.slotOverride || (state.day === BEAUTY_NEAREST_SLOT.day && state.slot === BEAUTY_NEAREST_SLOT.slot)
  const slotLabel = `${DAYS[state.day][0].toLowerCase()}, ${SLOTS[state.slot]}`
  const feeLabel = isPickup ? 'Бесплатно' : courier ? (fee ? '+' + fmt(fee) : 'Бесплатно') : '—'

  const confirm: Record<CourierId, string> = {
    smart: scenario.confirm,
    beauty: 'Марк привезёт заказ в подарочной упаковке',
    both: 'Ника поможет с товаром и привезёт его в подарочной упаковке',
  }
  const short: Record<CourierId, string> = {
    smart: scenario.short,
    beauty: 'Привезёт заказ в подарочной упаковке',
    both: 'Поможет с товаром и упакует в подарок',
  }
  const services: Record<CourierId, string[]> = {
    smart: scenario.services,
    beauty: BEAUTY_SERVICES,
    both: [...scenario.services.slice(0, 2), 'Подарочная упаковка'],
  }

  return {
    scenario,
    all,
    inCart,
    items,
    count,
    goods,
    goodsFull,
    discount,
    promoDiscount,
    isPickup,
    address,
    picked,
    courier,
    fee,
    feeLabel,
    total: goods - promoDiscount + fee,
    slotLabel,
    beautyAvailable,
    confirmText: picked ? confirm[picked] : '',
    shortText: picked ? short[picked] : '',
    courierServices: picked ? services[picked] : [],
  }
}
