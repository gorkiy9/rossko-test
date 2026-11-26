import { Page } from '../components/Page'
import { OrderSummary, Panel } from '../components/ui'
import { DAYS, SLOTS } from '../data'
import { useIsMobile } from '../hooks/useIsMobile'
import { useStore } from '../store'

export function Slot() {
  const { state, set } = useStore()
  const isMobile = useIsMobile()
  const days = isMobile ? DAYS.slice(0, 3) : DAYS
  // Новый слот снимает «перенос» из сценария C: пользователь выбрал время сам
  const pick = (patch: { day?: number; slot?: number }) => set({ ...patch, moved: true })

  const body = (
    <>
      <div role="group" aria-label="День" className="day-row">
        {days.map(([name, date], i) => (
          <button
            key={name}
            aria-pressed={state.day === i}
            className={state.day === i ? 'choice choice--day is-on' : 'choice choice--day'}
            onClick={() => pick({ day: i })}
          >
            <span className="choice__name">{name}</span>
            <span className="choice__date">{date}</span>
          </button>
        ))}
      </div>
      <div role="group" aria-label="Время" className="slot-grid">
        {SLOTS.map((t, i) => (
          <button
            key={t}
            aria-pressed={state.slot === i}
            className={state.slot === i ? 'choice choice--slot is-on' : 'choice choice--slot'}
            onClick={() => pick({ slot: i })}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="note">Курьеров на выбранное время покажем на следующем шаге.</p>
    </>
  )

  if (isMobile) {
    return (
      <Page title="Оформление заказа" step={2} back="/address" cta={{ to: '/courier', label: 'Выбрать курьера' }}>
        <h1 className="m-h1">Когда привезти?</h1>
        {body}
      </Page>
    )
  }

  return (
    <Page title="Оформление заказа" step={2} cta={{ to: '/courier', label: 'Выбрать курьера' }} aside={<OrderSummary />}>
      <Panel className="stack-20">
        <h2 className="panel__title">Когда привезти?</h2>
        {body}
      </Panel>
    </Page>
  )
}
