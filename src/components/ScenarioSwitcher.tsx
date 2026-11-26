import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRESETS, SCREEN_TITLES } from '../scenarios'
import { useStore } from '../store'
import type { ScreenId } from '../store'
import { Icon } from './Icon'

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
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    toggleRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="r-proto">
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
}
