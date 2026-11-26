import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'
import { Icon } from './Icon'
import { SiteHeader } from './SiteHeader'
import { Steps } from './Steps'
import type { StepNumber } from './Steps'

export interface Cta {
  to: string
  label: string
  /** Подпись на мобильной панели с суммой, если короче десктопной */
  mobileLabel?: string
  /** Нечего нажимать — показываем неактивную кнопку с этим текстом */
  disabledLabel?: string
}

interface Props {
  /** Заголовок страницы (h1 на десктопе, строка в шапке на мобильном) */
  title: string
  /** Заголовок мобильной шапки, если отличается от title */
  mobileTitle?: string
  mobileSubtitle?: string
  step?: StepNumber
  back?: string
  cta: Cta
  /** Сумма и подпись для нижней панели на мобильном; без неё — кнопка во всю ширину */
  mobileTotal?: { total: string; caption: string }
  /** Правая колонка на десктопе, под кнопкой */
  aside?: ReactNode
  /** Одна узкая колонка с кнопкой под ней (экран оценки) */
  narrow?: boolean
  children: ReactNode
}

export function Page(props: Props) {
  const isMobile = useIsMobile()
  useEffect(() => {
    document.title = `${props.title} — прототип`
    window.scrollTo(0, 0)
  }, [props.title])
  return isMobile ? <MobilePage {...props} /> : <DesktopPage {...props} />
}

function CtaButton({ cta, size, label }: { cta: Cta; size: 'lg' | 'md' | 'bar'; label?: string }) {
  if (cta.disabledLabel) {
    return (
      <button className={`btn btn--${size}`} disabled>
        {cta.disabledLabel}
      </button>
    )
  }
  return (
    <Link to={cta.to} className={`btn btn--primary btn--${size}`}>
      {label ?? cta.label}
    </Link>
  )
}

function DesktopPage({ title, step, cta, aside, narrow, children }: Props) {
  return (
    <div className="desktop">
      <SiteHeader />
      <main className="page">
        <div className="page__head">
          <h1 className="page__title">{title}</h1>
          {step && <Steps current={step} />}
        </div>
        {narrow ? (
          <div className="page__narrow">
            {children}
            <div className="page__narrow-cta">
              <CtaButton cta={cta} size="lg" />
            </div>
          </div>
        ) : (
          <div className="page__cols">
            <section className="page__main">{children}</section>
            <aside className="page__aside">
              <CtaButton cta={cta} size="lg" />
              {aside}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

function MobilePage({ title, mobileTitle, mobileSubtitle, step, back, cta, mobileTotal, children }: Props) {
  return (
    <div className="m-screen">
      <div className="m-appbar">
        <div className="m-appbar__row">
          {back ? (
            <Link to={back} aria-label="Назад" className="m-appbar__back">
              <Icon name="back" size={22} />
            </Link>
          ) : (
            <span className="m-appbar__spacer" />
          )}
          <div className="m-appbar__titles">
            <span className="m-appbar__title">{mobileTitle ?? title}</span>
            {mobileSubtitle && <span className="m-appbar__subtitle">{mobileSubtitle}</span>}
          </div>
        </div>
        {step && <Steps current={step} compact />}
      </div>
      <div className="m-content">{children}</div>
      <div className="m-footer">
        {mobileTotal ? (
          <div className="m-totalbar">
            <span className="m-totalbar__sum">
              <span className="m-totalbar__total">{mobileTotal.total}</span>
              <span className="m-totalbar__caption">{mobileTotal.caption}</span>
            </span>
            <CtaButton cta={cta} size="bar" label={cta.mobileLabel} />
          </div>
        ) : (
          <CtaButton cta={cta} size="md" label={cta.mobileLabel} />
        )}
      </div>
    </div>
  )
}
