import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { LogoMark } from '../components/Logo'
import { Segmented } from '../components/shop'
import { SCENARIO_SLOT_ID } from '../components/ScenarioSwitcher'
import { Brief } from './Brief'

type Tab = 'brief' | 'prototype'
type Device = 'phone' | 'desktop'

const PROTO_START = '#/cart'
const tabFromHash = (): Tab => (window.location.hash === '#prototype' ? 'prototype' : 'brief')

/**
 * Презентация тестового: текст задания и прототип на одной странице, переключаются сегментами в шапке.
 * Прототип живёт в iframe — так его шапка, липкие панели и роутер работают как в отдельном приложении.
 */
export function Presentation() {
  const [tab, setTab] = useState<Tab>(tabFromHash)
  const [device, setDevice] = useState<Device>('phone')
  // Адрес внутри прототипа; key пересоздаёт iframe, когда сценарий выбран из текста
  const [proto, setProto] = useState({ path: PROTO_START, key: 0 })
  // iframe грузим только после первого открытия вкладки, дальше держим живым, чтобы не терять состояние
  const [protoMounted, setProtoMounted] = useState(tab === 'prototype')
  const briefScroll = useRef(0)

  const go = useCallback((next: Tab) => {
    setTab((prev) => {
      if (prev === next) return prev
      if (prev === 'brief') briefScroll.current = window.scrollY
      return next
    })
    if (next === 'prototype') setProtoMounted(true)
    history.replaceState(null, '', next === 'prototype' ? '#prototype' : window.location.pathname + window.location.search)
  }, [])

  // Возврат к тексту — на то же место, где читатель остановился
  useEffect(() => {
    window.scrollTo(0, tab === 'brief' ? briefScroll.current : 0)
  }, [tab])

  useEffect(() => {
    const onHash = () => go(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [go])

  const openInPrototype = useCallback(
    (path: string) => {
      setProto((p) => ({ path, key: p.key + 1 }))
      go('prototype')
    },
    [go],
  )

  const src = `./prototype.html${proto.path}`

  return (
    <div className={`p-app p-app--${tab}`}>
      <header className="p-bar">
        <div className="p-bar__inner">
          <a href="./" className="p-bar__brand" onClick={(e) => (e.preventDefault(), go('brief'))}>
            <LogoMark size={28} />
            <span className="p-bar__title">
              Выбор курьера
              <span className="p-bar__sub">Тестовое задание</span>
            </span>
          </a>
          <Segmented<Tab>
            className="r-seg--bar"
            label="Раздел"
            value={tab}
            onChange={go}
            options={[
              { id: 'brief', title: 'Задание' },
              { id: 'prototype', title: 'Прототип' },
            ]}
          />
          <div className="p-bar__end">
            <a className="r-btn r-btn--sm r-btn--soft p-bar__open" href={src} target="_blank" rel="noreferrer">
              Открыть отдельно
              <Icon name="chevron-right" size={16} />
            </a>
          </div>
        </div>
      </header>

      <main className="p-brief" hidden={tab !== 'brief'}>
        <Brief onOpen={openInPrototype} />
      </main>

      {protoMounted && (
        <section className={`p-stage p-stage--${device}`} hidden={tab !== 'prototype'} aria-label="Прототип">
          <div className="p-stage__bar">
            <Segmented<Device>
              className="r-seg--bar r-seg--device"
              label="Размер экрана"
              value={device}
              onChange={setDevice}
              options={[
                { id: 'phone', title: 'Телефон' },
                { id: 'desktop', title: 'Компьютер' },
              ]}
            />
            {/* Сюда прототип переносит меню «Сценарий» */}
            <div id={SCENARIO_SLOT_ID} className="p-stage__slot" />
          </div>
          <div className="p-stage__frame">
            <iframe key={proto.key} src={src} title="Прототип оформления заказа" onLoad={(e) => focusCourier(e.currentTarget, proto.path)} />
          </div>
        </section>
      )}
    </div>
  )
}

/** Состояния A–E — про блок «Кто привезёт заказ»: сразу показываем его, а не начало оформления */
function focusCourier(frame: HTMLIFrameElement, path: string) {
  if (!path.startsWith('#/checkout')) return
  let tries = 0
  const tick = () => {
    const el = frame.contentDocument?.getElementById('courier')
    if (el) el.scrollIntoView({ block: 'start' })
    else if (tries++ < 30) requestAnimationFrame(tick)
  }
  tick()
}
