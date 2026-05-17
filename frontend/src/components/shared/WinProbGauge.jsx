import { useEffect, useRef } from 'react'
import './WinProbGauge.css'

export default function WinProbGauge({ before = 0, after = 0 }) {
  const needleRef = useRef(null)

  useEffect(() => {
    const el = needleRef.current
    if (!el) return
    const deg = -90 + (after / 100) * 180
    el.style.transform = `rotate(${deg}deg)`
  }, [after])

  const delta = after - before
  const deltaStr = delta >= 0 ? `+${delta.toFixed(0)}%` : `${delta.toFixed(0)}%`
  const deltaColor = delta >= 0 ? 'var(--green)' : 'var(--coral)'

  return (
    <div className="gauge">
      <div className="gauge__title">Win Probability</div>
      <div className="gauge__arc-wrap">
        <svg viewBox="0 0 120 70" className="gauge__svg">
          {/* Track */}
          <path d="M 10 65 A 55 55 0 0 1 110 65" fill="none" stroke="var(--border-default)" strokeWidth="8" strokeLinecap="round"/>
          {/* Before fill */}
          <path
            d="M 10 65 A 55 55 0 0 1 110 65"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(before / 100) * 172.8} 172.8`}
          />
          {/* After fill */}
          <path
            className="gauge__fill"
            d="M 10 65 A 55 55 0 0 1 110 65"
            fill="none"
            stroke="var(--green)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(after / 100) * 172.8} 172.8`}
          />
          {/* Center needle pivot */}
          <circle cx="60" cy="65" r="4" fill="var(--gold)" />
          {/* Needle */}
          <g ref={needleRef} style={{ transformOrigin: '60px 65px', transform: `rotate(${-90 + (after / 100) * 180}deg)`, transition: 'transform 1s var(--ease-spring)' }}>
            <line x1="60" y1="65" x2="60" y2="18" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
          </g>
          <text x="60" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="7">WIN PROB</text>
        </svg>
      </div>
      <div className="gauge__values">
        <div className="gauge__val">
          <span className="gauge__val-label">Before</span>
          <span className="gauge__val-num font-mono">{before}%</span>
        </div>
        <div className="gauge__val gauge__val--delta" style={{ color: deltaColor }}>
          <span className="gauge__val-label">Change</span>
          <span className="gauge__val-num font-mono">{deltaStr}</span>
        </div>
        <div className="gauge__val">
          <span className="gauge__val-label">After</span>
          <span className="gauge__val-num font-mono" style={{ color: 'var(--green)' }}>{after}%</span>
        </div>
      </div>
    </div>
  )
}
