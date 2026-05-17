import { useState, useEffect } from 'react'
import ScoreboardStrip from '../ScoreboardStrip/ScoreboardStrip'
import MatchInputForm from '../MatchInputForm/MatchInputForm'
import DebateTheater from '../DebateTheater/DebateTheater'
import CaptainCallCard from '../CaptainCallCard/CaptainCallCard'
import OverHistoryDrawer from '../OverHistoryDrawer/OverHistoryDrawer'
import { useDebateStream } from '../../hooks/useDebateStream'
import './MatchCommandCenter.css'

// LocalStorage key for persistent history
const HISTORY_KEY = 'captain_cool_history_v1'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-20))) } catch {}
}

export default function MatchCommandCenter({ onBack }) {
  const [matchState, setMatchState]       = useState(null)
  const [activeTab, setActiveTab]         = useState('input')
  const [drawerOpen, setDrawerOpen]       = useState(false)
  const [history, setHistory]             = useState(loadHistory)
  const [savedThisRun, setSavedThisRun]   = useState(false)
  const [captainOverride, setCaptainOverride] = useState('')
  const [showOverride, setShowOverride]   = useState(false)

  const { debate, status, captainsCall, error, retryInfo, overrideActive, startStream, reset } = useDebateStream()

  // Persist history to localStorage on every change
  useEffect(() => { saveHistory(history) }, [history])

  const handleSubmit = (state) => {
    setMatchState({ ...state, captainOverride: captainOverride.trim() || undefined })
    setActiveTab('debate')
    setSavedThisRun(false)
    startStream({ ...state, captainOverride: captainOverride.trim() || undefined })
  }

  const handleRedebate = () => {
    reset()
    setActiveTab('input')
    setSavedThisRun(false)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  // Auto-save captain's call to history once per run
  if (captainsCall && !savedThisRun) {
    setSavedThisRun(true)
    const entry = {
      ...captainsCall,
      id:   Date.now(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
    setHistory(prev => {
      const updated = [...prev, entry]
      saveHistory(updated)
      return updated
    })
  }
  if (!captainsCall && savedThisRun) setSavedThisRun(false)

  const isRunning = status === 'running'
  const isDone    = status === 'complete'

  return (
    <div className="mcc">
      <ScoreboardStrip matchState={matchState} />

      {/* Mobile tabs */}
      <div className="mcc__tabs">
        {[
          { id: 'input',  label: '📋 Input' },
          { id: 'debate', label: '🎭 Debate' },
          { id: 'call',   label: '🏏 Call', badge: isDone },
        ].map(t => (
          <button key={t.id} id={`tab-${t.id}`}
            className={`mcc__tab ${activeTab === t.id ? 'mcc__tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
            {t.badge && <span className="mcc__tab-badge" />}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mcc__error" role="alert">
          ⚠️ {error}
          <button onClick={reset} className="mcc__error-dismiss">Dismiss</button>
        </div>
      )}

      {/* Retry notification */}
      {retryInfo && (
        <div className="mcc__retry-banner">
          🔄 Retrying <strong>{retryInfo.agent}</strong> (attempt {retryInfo.attempt}) — waiting {retryInfo.wait}s…
        </div>
      )}

      {/* Override injected notification */}
      {overrideActive && (
        <div className="mcc__override-banner">
          ⚠️ Captain's Override injected into debate!
        </div>
      )}

      <div className="mcc__body">
        {/* Left — Input */}
        <aside className={`mcc__panel mcc__panel--left ${activeTab === 'input' ? 'mcc__panel--visible' : ''}`}>
          <div className="panel-header">
            <span className="panel-title">MATCH STATE</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button id="history-btn" className="panel-back-btn" onClick={() => setDrawerOpen(true)} title="Decision history">
                📜{history.length > 0 && <span className="history-count"> {history.length}</span>}
              </button>
              <button className="panel-back-btn" onClick={onBack} id="back-to-home-btn">← Home</button>
            </div>
          </div>

          {/* Captain's Override toggle */}
          <div className="override-toggle-row">
            <button
              type="button"
              className={`override-toggle-btn ${showOverride ? 'override-toggle-btn--on' : ''}`}
              onClick={() => setShowOverride(v => !v)}
              id="toggle-override-btn"
            >
              {showOverride ? '✕ Cancel Override' : '⚡ Captain\'s Override'}
            </button>
          </div>
          {showOverride && (
            <div className="override-section">
              <label className="form-label">Your tactical input (injected into debate)</label>
              <textarea
                className="override-textarea"
                placeholder={`e.g. "What if we deploy the Impact Player as a pinch hitter right now?"`}
                value={captainOverride}
                onChange={e => setCaptainOverride(e.target.value)}
                maxLength={300}
                id="captain-override-input"
              />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
                {captainOverride.length}/300
              </span>
            </div>
          )}

          <MatchInputForm onSubmit={handleSubmit} locked={isRunning} />
        </aside>

        {/* Centre — Debate */}
        <main className={`mcc__panel mcc__panel--center ${activeTab === 'debate' ? 'mcc__panel--visible' : ''}`}>
          <DebateTheater debate={debate} overallStatus={status} />
        </main>

        {/* Right — Captain's Call */}
        <aside className={`mcc__panel mcc__panel--right ${activeTab === 'call' ? 'mcc__panel--visible' : ''}`}>
          <div className="panel-header">
            <span className="panel-title">CAPTAIN'S CALL</span>
            {isDone && <span className="badge badge-gold">● DECIDED</span>}
          </div>

          {!captainsCall && (
            <div className="mcc__call-idle">
              <div className="mcc__call-idle-icon">🏏</div>
              <p>
                {isRunning
                  ? 'Agents are debating… Stand by for the captain\'s verdict.'
                  : 'The decision will appear here once the debate concludes.'}
              </p>
              {isRunning && <div className="mcc__call-idle-spinner" />}
            </div>
          )}

          {captainsCall && (
            <CaptainCallCard captainsCall={captainsCall} onRedebate={handleRedebate} />
          )}
        </aside>
      </div>

      <OverHistoryDrawer
        history={history}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClear={clearHistory}
      />
    </div>
  )
}
