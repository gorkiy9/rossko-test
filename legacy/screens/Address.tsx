import { Page } from '../components/Page'
import { Field, OrderSummary, Panel, Radio } from '../components/ui'
import { ADDRESSES } from '../data'
import { useIsMobile } from '../hooks/useIsMobile'
import { useStore } from '../store'

export function Address() {
  const { state, set } = useStore()
  const isMobile = useIsMobile()
  const comment = (
    <Field
      id="cmt"
      label="Комментарий курьеру"
      multiline
      placeholder="Например: домофон не работает"
      value={state.comment}
      onChange={(comment) => set({ comment })}
    />
  )

  if (isMobile) {
    const home = ADDRESSES[0]
    return (
      <Page title="Оформление заказа" step={1} back="/cart" cta={{ to: '/slot', label: 'Выбрать время' }}>
        <h1 className="m-h1">Куда доставить?</h1>
        <div className="panel m-address is-selected">
          <Radio on />
          <span className="stack-4">
            <span className="m-address__title">{home.title}</span>
            <span className="m-address__street">{home.street}</span>
          </span>
        </div>
        <div className="row-12">
          <Field id="apt" label="Квартира" value={state.apt} onChange={(apt) => set({ apt })} />
          <Field id="ent" label="Подъезд" value={state.entrance} onChange={(entrance) => set({ entrance })} />
        </div>
        {comment}
      </Page>
    )
  }

  return (
    <Page
      title="Оформление заказа"
      step={1}
      cta={{ to: '/slot', label: 'Выбрать время' }}
      aside={<OrderSummary />}
    >
      <Panel className="stack-16">
        <h2 className="panel__title">Куда доставить?</h2>
        <div className="choice-row" role="radiogroup" aria-label="Адрес">
          {ADDRESSES.map((a) => (
            <button
              key={a.id}
              role="radio"
              aria-checked={state.address === a.id}
              className={state.address === a.id ? 'option option--row is-selected' : 'option option--row'}
              onClick={() => set({ address: a.id })}
            >
              <Radio on={state.address === a.id} />
              <span className="stack-4">
                <span className="option__title">{a.title}</span>
                <span className="option__caption">{a.street}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="fields-row">
          <Field id="apt" label="Квартира" value={state.apt} onChange={(apt) => set({ apt })} />
          <Field id="ent" label="Подъезд" value={state.entrance} onChange={(entrance) => set({ entrance })} />
          <Field id="fl" label="Этаж" value={state.floor} onChange={(floor) => set({ floor })} />
          <Field id="ic" label="Домофон" value={state.intercom} onChange={(intercom) => set({ intercom })} />
        </div>
        {comment}
      </Panel>
    </Page>
  )
}
