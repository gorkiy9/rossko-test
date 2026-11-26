import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { PRESETS, SCREEN_TITLES } from '../scenarios'
import { useStore } from '../store'
import type { ScreenId } from '../store'
import { Icon } from './Icon'

/** id места в презентации рядом с переключателем «Телефон / Компьютер» */
export const SCENARIO_SLOT_ID = 'proto-scenario-slot'

/**
 * Прототип открыт внутри презентации на широком экране — меню переезжает
 * в её панель над рамкой. Отдельно и на телефоне остаётся плавающей кнопкой.
 */
function useDockSlot(): HTMLElement | null {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    let host: Window
    try {
      if (window.parent === window) return
      host = window.parent
      void host.document // другой источник — бросит
    } catch {
      return
    }
    const wide = host.matchMedia('(min-width: 960px)')
    const sync = () => setSlot(wide.matches ? host.document.getElementById(SCENARIO_SLOT_ID) : null)
    sync()
    wide.addEventListener('change', sync)
    return () => wide.removeEventListener('change', sync)
  }, [])
  return slot
}

/**
 * Служебное меню прототипа. На каждом экране — только его сценарии,
 * внизу — «Сбросить сценарий»: всё с начала, в корзину.
 */
export function ScenarioSwitcher({ screen, onApply }: { screen: ScreenId; onApply?: () => void }) {
  const { state, update, resetAll } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const slot = useDockSlot()

  const presets = PRESETS[screen]
  const active = presets.find((p) => p.match(state))

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    // В доке меню в документе презентации, а клик «мимо» может прийти и из прототипа
    const docs = slot ? [document, slot.ownerDocument] : [document]
    for (const d of docs) {
      d.addEventListener('pointerdown', onDown)
      d.addEventListener('keydown', onKey)
    }
    return () => {
      for (const d of docs) {
        d.removeEventListener('pointerdown', onDown)
        d.removeEventListener('keydown', onKey)
      }
    }
  }, [open, slot])

  const close = () => {
    setOpen(false)
    toggleRef.current?.focus()
  }

  const ui = (
    <div ref={rootRef} className={slot ? 'r-proto r-proto--docked' : 'r-proto'}>
      {open && (
        <div className="r-proto__menu" role="menu" aria-label={SCREEN_TITLES[screen]}>
          <span className="r-proto__head" aria-hidden="true">
            {SCREEN_TITLES[screen]}
          </span>
          {presets.map((p) => {
            const on = p === active
            return (
              <button
                key={p.id}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                className={on ? 'r-proto__item is-on' : 'r-proto__item'}
                onClick={() => {
                  update(p.apply)
                  onApply?.()
                  close()
                }}
              >
                <span className="r-proto__text">
                  <span className="r-proto__label">{p.label}</span>
                  <span className="r-proto__desc">{p.description}</span>
                </span>
                {on && <Icon name="check" size={16} className="r-proto__check" />}
              </button>
            )
          })}
          <span className="r-proto__sep" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="r-proto__item r-proto__item--reset"
            onClick={() => {
              resetAll()
              onApply?.()
              close()
              navigate('/cart')
            }}
          >
            <Icon name="reload" size={16} />
            <span className="r-proto__text">
              <span className="r-proto__label">Сбросить сценарий</span>
              <span className="r-proto__desc">Исходная корзина, формы с начала</span>
            </span>
          </button>
        </div>
      )}
      <button
        ref={toggleRef}
        type="button"
        className="r-proto__toggle"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="filter" size={16} />
        <span>Сценарий</span>
        {active && <span className="r-proto__current">· {active.label}</span>}
      </button>
    </div>
  )

  return slot ? createPortal(ui, slot) : ui
}
