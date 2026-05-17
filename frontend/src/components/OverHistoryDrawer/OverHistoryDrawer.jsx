import './OverHistoryDrawer.css'

export default function OverHistoryDrawer({ history, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}
      <div className={`drawer ${isOpen ? 'drawer--open' : ''}`} role="dialog" aria-label="Over History">
        <div className="drawer__header">
          <span className="drawer__title">📜 OVER HISTORY</span>
          <button className="drawer__close" onClick={onClose} id="close-history-btn">×</button>
        </div>
        <div className="drawer__body">
          {history.length === 0 ? (
            <div className="drawer__empty">
              <span style={{ fontSize: 32, opacity: 0.3 }}>📋</span>
              <p>No decisions yet. Run your first analysis to start building the log.</p>
            </div>
          ) : (
            [...history].reverse().map((entry, i) => (
              <HistoryEntry key={entry.id || i} entry={entry} index={history.length - i} />
            ))
          )}
        </div>
      </div>
    </>
  )
}

function HistoryEntry({ entry, index }) {
  const confPct = Math.round((entry.confidence || 0) * 100)
  const confColor =
    confPct >= 80 ? 'var(--green)' :
    confPct >= 60 ? 'var(--rrr-mid)' : 'var(--coral)'

  return (
    <details className="history-entry">
      <summary className="history-entry__summary">
        <div className="history-entry__over">
          <span className="history-entry__over-label">ANALYSIS</span>
          <span className="history-entry__over-num">#{index}</span>
        </div>
        <div className="history-entry__decision">{entry.decision || 'Decision recorded'}</div>
        <div className="history-entry__meta">
          <span className="history-entry__conf" style={{ color: confColor }}>
            {confPct}% conf
          </span>
          <span className="history-entry__time">{entry.time || ''}</span>
        </div>
      </summary>
      <div className="history-entry__detail">
        <p className="history-entry__reasoning">{entry.reasoning || entry.commentaryOutput}</p>
        <div className="history-entry__probs">
          <span>Win prob: <strong>{entry.winProbBefore}%</strong> → <strong style={{ color: 'var(--green)' }}>{entry.winProbAfter}%</strong></span>
        </div>
      </div>
    </details>
  )
}
