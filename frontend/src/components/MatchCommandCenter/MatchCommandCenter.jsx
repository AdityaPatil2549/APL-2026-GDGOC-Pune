import { useState } from 'react'
import ScoreboardStrip from '../ScoreboardStrip/ScoreboardStrip'
import MatchInputForm from '../MatchInputForm/MatchInputForm'
import DebateTheater from '../DebateTheater/DebateTheater'
import CaptainCallCard from '../CaptainCallCard/CaptainCallCard'
import OverHistoryDrawer from '../OverHistoryDrawer/OverHistoryDrawer'
import { useDebateStream } from '../../hooks/useDebateStream'
import './MatchCommandCenter.css'

export default function MatchCommandCenter({ onBack }) {
  const [matchState, setMatchState] = useState(null)
  const [activeTab, setActiveTab]   = useState('input')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [history, setHistory]       = useState([])
  const { debate, status, captainsCall, error, startStream, reset } = useDebateStream()

  const handleSubmit = (state) => {
    setMatchState(state)
    setActiveTab('debate')
    startStream(state)
  }

  const handleRedebate = () => {
    reset()
    setActiveTab('input')
  }

  // Save to history when a call completes
  const handleCallComplete = (call) => {
    if (!call) return
    setHistory(prev => [...prev, {
      ...call,
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }])
  }

  // Auto-save when captainsCall arrives (first time per run)
  const [savedThisRun, setSavedThisRun] = useState(false)
  if (captainsCall && !savedThisRun) {
    setSavedThisRun(true)
    handleCallComplete(captainsCall)
  }
  if (!captainsCall && savedThisRun) setSavedThisRun(false)

  const isRunning = status === 'running'
  const isDone    = status === 'complete'

  return (
    <div className="mcc">
      {/* Scoreboard */}
      <ScoreboardStrip matchState={matchState} />

      {/* Mobile tab bar */}
      <div className="mcc__tabs">
        {[
          { id: 'input',  label: '📋 Input' },
          { id: 'debate', label: '🎭 Debate' },
          { id: 'call',   label: "🏏 Call", badge: isDone },
        ].map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            className={`mcc__tab ${activeTab === t.id ? 'mcc__tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
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

      {/* Main 3-col layout */}
      <div className="mcc__body">

        {/* Left — Input */}
        <aside className={`mcc__panel mcc__panel--left ${activeTab === 'input' ? 'mcc__panel--visible' : ''}`}>
          <div className="panel-header">
            <span className="panel-title">MATCH STATE</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                id="history-btn"
                className="panel-back-btn"
                onClick={() => setDrawerOpen(true)}
                title="View decision history"
              >
                📜 {history.length > 0 && <span className="mcc__tab-badge" style={{ position: 'static', display: 'inline-block', width: 6, height: 6, verticalAlign: 'middle', marginLeft: 2 }} />}
              </button>
              <button className="panel-back-btn" onClick={onBack} id="back-to-home-btn">← Home</button>
            </div>
          </div>
          <MatchInputForm onSubmit={handleSubmit} locked={isRunning} />
        </aside>

        {/* Centre — Debate Theater */}
        <main className={`mcc__panel mcc__panel--center ${activeTab === 'debate' ? 'mcc__panel--visible' : ''}`}>
          <DebateTheater debate={debate} overallStatus={status} />
        </main>

        {/* Right — Captain's Call */}
        <aside className={`mcc__panel mcc__panel--right scroll-panel ${activeTab === 'call' ? 'mcc__panel--visible' : ''}`}>
          <div className="panel-header">
            <span className="panel-title">CAPTAIN'S CALL</span>
            {isDone && <span className="badge badge-gold">● DECIDED</span>}
          </div>

          {!captainsCall && (
            <div className="mcc__call-idle">
              <div className="mcc__call-idle-icon">🏏</div>
              <p>
                {isRunning
                  ? 'The agents are debating… Stand by for the captain\'s verdict.'
                  : 'The captain\'s decision will appear here once the debate concludes.'}
              </p>
              {isRunning && <div className="mcc__call-idle-spinner" />}
            </div>
          )}

          {captainsCall && (
            <CaptainCallCard captainsCall={captainsCall} onRedebate={handleRedebate} />
          )}
        </aside>

      </div>

      {/* Over History Drawer */}
      <OverHistoryDrawer
        history={history}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
