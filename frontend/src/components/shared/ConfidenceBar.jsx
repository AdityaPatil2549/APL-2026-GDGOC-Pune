import { useEffect, useRef } from 'react'
import './ConfidenceBar.css'

export default function ConfidenceBar({ value, color = 'var(--gold)', label }) {
  const barRef = useRef(null)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.setProperty('--target-width', `${value}%`)
    el.classList.remove('bar-animate')
    void el.offsetWidth
    el.classList.add('bar-animate')
  }, [value])

  return (
    <div className="conf-bar">
      {label && <div className="conf-bar__label">{label}</div>}
      <div className="conf-bar__track">
        <div
          ref={barRef}
          className="conf-bar__fill"
          style={{ '--bar-color': color }}
        />
        <span className="conf-bar__pct font-mono">{value}%</span>
      </div>
    </div>
  )
}
