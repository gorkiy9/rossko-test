import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export const STEPS = [
  { n: 1, label: 'Адрес', to: '/address' },
  { n: 2, label: 'Время', to: '/slot' },
  { n: 3, label: 'Курьер', to: '/courier' },
  { n: 4, label: 'Оплата', to: '/payment' },
] as const

export type StepNumber = (typeof STEPS)[number]['n']

export function Steps({ current, compact }: { current: StepNumber; compact?: boolean }) {
  return (
    <ol aria-label="Шаги оформления" className={compact ? 'steps steps--compact' : 'steps'}>
      {STEPS.map((s, i) => {
        const state = s.n < current ? 'done' : s.n === current ? 'current' : 'todo'
        return (
          <Fragment key={s.n}>
            {i > 0 && !compact && <li aria-hidden="true" className="steps__sep" />}
            <li className={`step step--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="step__badge">
                {state === 'done' ? <Icon name="check" size={compact ? 11 : 14} stroke={compact ? 3 : 2.6} /> : s.n}
              </span>
              {state === 'done' ? (
                <Link to={s.to} className="step__link">
                  {s.label}
                </Link>
              ) : (
                s.label
              )}
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
