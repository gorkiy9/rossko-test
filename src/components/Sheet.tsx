import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * Шторка на нативном <dialog>: фокус внутри, Esc и затемнение даёт браузер.
 * Телефон (< 600 px) — снизу, тянется за палец 1:1 и закрывается свайпом вниз
 * (по расстоянию или по скорости). Шире — окно по центру, без жеста.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; t: number; dy: number; id: number } | null>(null)

  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      // Шторка ещё за нижним краем, а браузер уже сфокусировал крестик и прокрутил
      // к нему сам <dialog> — после въезда она оказалась бы у верха экрана.
      // Возвращаем прокрутку и фокусируем без прокрутки (overflow: clip в CSS это и закрепляет).
      d.scrollTop = 0
      d.querySelector<HTMLElement>('.r-sheet__close')?.focus({ preventScroll: true })
      // Фиксируем закрытое положение, чтобы переход стартовал из него, и только потом открываем
      void panelRef.current?.offsetHeight
      d.dataset.state = 'open'
      return
    }
    if (!open && d.open) {
      clearDrag()
      d.dataset.state = 'closing'
      let done = false
      const finish = () => {
        if (done) return
        done = true
        d.close()
        delete d.dataset.state
      }
      panelRef.current?.addEventListener('transitionend', finish, { once: true })
      // Страховка: при prefers-reduced-motion transitionend может не прийти
      const timer = window.setTimeout(finish, 600)
      return () => window.clearTimeout(timer)
    }
  }, [open])

  function clearDrag() {
    const p = panelRef.current
    const o = overlayRef.current
    if (p) {
      p.style.transition = ''
      p.style.transform = ''
    }
    if (o) {
      o.style.transition = ''
      o.style.opacity = ''
    }
  }

  const isPhone = () => window.matchMedia('(max-width: 599px)').matches

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isPhone() || drag.current) return // второй палец не перехватывает жест
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { y: e.clientY, t: performance.now(), dy: 0, id: e.pointerId }
    if (panelRef.current) panelRef.current.style.transition = 'none'
    if (overlayRef.current) overlayRef.current.style.transition = 'none'
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = drag.current
    const p = panelRef.current
    if (!g || e.pointerId !== g.id || !p) return
    const raw = e.clientY - g.y
    // Вверх — с сопротивлением, вниз — ровно за пальцем
    const dy = raw < 0 ? raw * 0.15 : raw
    g.dy = dy
    p.style.transform = `translateY(${dy}px)`
    if (overlayRef.current) overlayRef.current.style.opacity = String(Math.max(0, 1 - dy / p.offsetHeight))
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = drag.current
    const p = panelRef.current
    if (!g || e.pointerId !== g.id || !p) return
    drag.current = null
    const velocity = g.dy / Math.max(1, performance.now() - g.t) // px/ms
    if (g.dy > p.offsetHeight * 0.3 || (g.dy > 24 && velocity > 0.5)) {
      onClose()
    } else {
      clearDrag()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="r-sheet"
      aria-labelledby="sheet-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <div ref={overlayRef} className="r-sheet__overlay" onClick={onClose} />
      <div ref={panelRef} className="r-sheet__panel">
        <div
          className="r-sheet__grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="r-sheet__handle" aria-hidden="true" />
          <div className="r-sheet__head">
            <h2 id="sheet-title" className="r-sheet__title">
              {title}
            </h2>
            <button type="button" className="r-icon-btn r-sheet__close" aria-label="Закрыть" onClick={onClose}>
              <Icon name="close" size={24} />
            </button>
          </div>
        </div>
        <div className="r-sheet__body">{children}</div>
        {footer && <div className="r-sheet__footer">{footer}</div>}
      </div>
    </dialog>
  )
}
