import { useEffect, useRef } from 'react'
import './ScoreboardStrip.css'

function FlipDigit({ value }) {
  const ref = useRef(null)
  const prev = useRef(value)
  useEffect(() => {
    if (ref.current && prev.current !== value) {
      ref.current.classList.remove('flip')
      void ref.current.offsetWidth
      ref.current.classList.add('flip')
      prev.current = value
    }
  }, [value])
  return <span ref={ref} className="flip-digit font-display">{value}</span>
}

function Score({ runs, wickets }) {
  const runsStr = String(runs).padStart(3, ' ')
  const wkStr = String(wickets)
  return (
    <div className="sb__score">
      {runsStr.split('').map((d, i) => <FlipDigit key={i} value={d.trim() || '0'} />)}
      <span className="sb__score-sep">/</span>
      {wkStr.split('').map((d, i) => <FlipDigit key={i} value={d} />)}
    </div>
  )
}

function RRRBadge({ value }) {
  const cls = value < 8 ? 'rrr-low' : value < 12 ? 'rrr-mid' : 'rrr-high'
  return (
    <div className={`sb__rrr ${cls}`}>
      <span className="sb__rrr-label">RRR</span>
      <span className="sb__rrr-val font-mono">{value.toFixed(1)}</span>
    </div>
  )
}

export default function ScoreboardStrip({ matchState }) {
  if (!matchState) return null
  const { battingTeam, bowlingTeam, score, wickets, over, ball, target, innings, dewFactor, venue } = matchState
  const ballsRemaining = (20 - over) * 6 - (ball || 0)
  const runsNeeded = target ? target - score : 0
  const rrr = innings === 2 && ballsRemaining > 0 ? (runsNeeded / (ballsRemaining / 6)) : 0

  return (
    <div className="scoreboard-strip">
      <div className="sb__team">{battingTeam || 'BATTING'}</div>
      <Score runs={score || 0} wickets={wickets || 0} />
      <div className="sb__over font-mono">
        <span className="sb__over-label">OV</span>
        <span className="sb__over-val">{over}.{ball || 0}</span>
      </div>
      {innings === 2 && target && (
        <>
          <div className="sb__divider" />
          <div className="sb__target font-mono">
            <span className="sb__target-label">TGT</span>
            <span className="sb__target-val">{target}</span>
          </div>
          <RRRBadge value={rrr} />
        </>
      )}
      <div className="sb__divider" />
      <div className="sb__vs">vs</div>
      <div className="sb__team sb__team--bowling">{bowlingTeam || 'BOWLING'}</div>
      <div className="sb__divider" />
      {dewFactor && dewFactor !== 'none' && (
        <div className={`sb__dew ${dewFactor === 'heavy' ? 'sb__dew--heavy' : ''}`}>
          💧 {dewFactor}
        </div>
      )}
      <div className="sb__venue">{venue?.split(',')[0] || 'Venue'}</div>
      <div className="sb__gemini gemini-badge" style={{ marginLeft: 'auto' }}>
        <span>Gemini</span> Powered
      </div>
    </div>
  )
}
