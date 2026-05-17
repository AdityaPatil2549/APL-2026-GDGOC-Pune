import { useEffect, useRef } from 'react'
import AgentCard from '../AgentCard/AgentCard'
import './DebateTheater.css'

const SEQUENCE = [
  { id: 'stats_analyst',      badge: null },
  { id: 'strategist',         badge: null },
  { id: 'devils_advocate',    badge: 'CHALLENGED' },
  { id: 'strategist_revised', badge: 'REVISED' },
  { id: 'commentator',        badge: null },
]

export default function DebateTheater({ debate, overallStatus }) {
  const bottomRef  = useRef(null)
  const scrollRef  = useRef(null)
  const isIdle     = overallStatus === 'idle'
  const isRunning  = overallStatus === 'running'
  const isComplete = overallStatus === 'complete'

  // Auto-scroll: track the active typing agent
  useEffect(() => {
    if (isRunning && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [debate, isRunning])

  return (
    <div className="debate-theater">
      {/* Header */}
      <div className="theater__header">
        <span className="theater__title">DEBATE THEATER</span>
        <div className="theater__live">
          {isRunning && (
            <>
              <span className="live-dot" />
              <span className="theater__live-label">LIVE</span>
            </>
          )}
          {isComplete && <span className="badge badge-green">COMPLETE ✓</span>}
          {isIdle && <span className="theater__idle-hint">Waiting for match state…</span>}
        </div>
      </div>

      {/* Idle placeholder */}
      {isIdle && (
        <div className="theater__idle">
          <div className="theater__idle-orb" />
          <div className="theater__idle-agents">
            {SEQUENCE.slice(0, 4).map((s, i) => (
              <div key={s.id} className="theater__idle-agent" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="theater__idle-avatar" />
              </div>
            ))}
          </div>
          <p className="theater__idle-text">
            Fill in match state and click <strong>⚡ STRATEGIZE</strong> to summon the agents.
          </p>
        </div>
      )}

      {/* Assembling spinner */}
      {isRunning && Object.values(debate).every(v => !v) && (
        <div className="theater__assembling">
          <div className="theater__ball-spin">🏏</div>
          <p>Agents assembling…</p>
        </div>
      )}

      {/* Agent cards with auto-scroll anchor */}
      <div className="theater__cards" ref={scrollRef}>
        {SEQUENCE.map((seq, i) => {
          const msg = debate[seq.id]
          if (!msg) return null
          return (
            <AgentCard
              key={seq.id}
              agentId={seq.id}
              message={msg.content}
              status={msg.status}
              badge={
                seq.badge === 'CHALLENGED' && msg.status === 'complete' ? 'CHALLENGED' :
                seq.badge === 'REVISED'    && msg.status === 'complete' ? 'REVISED'    : null
              }
              toolCall={seq.id === 'stats_analyst' ? msg.toolCall : null}
              delay={i * 80}
            />
          )
        })}
        {/* Auto-scroll anchor */}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>
    </div>
  )
}
