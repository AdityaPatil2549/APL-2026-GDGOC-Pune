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
  const isIdle = overallStatus === 'idle'

  return (
    <div className="debate-theater">
      {/* Header */}
      <div className="theater__header">
        <span className="theater__title">DEBATE THEATER</span>
        <div className="theater__live">
          {overallStatus === 'running' && (
            <>
              <span className="live-dot" />
              <span className="theater__live-label">LIVE</span>
            </>
          )}
          {overallStatus === 'complete' && (
            <span className="badge badge-green">COMPLETE ✓</span>
          )}
          {isIdle && (
            <span className="theater__idle-hint">Waiting for match state…</span>
          )}
        </div>
      </div>

      {/* Idle state */}
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
          <p className="theater__idle-text">Fill in the match state and click <strong>⚡ STRATEGIZE</strong> to summon the agents.</p>
        </div>
      )}

      {/* Assembling */}
      {overallStatus === 'running' && Object.values(debate).every(v => !v) && (
        <div className="theater__assembling">
          <div className="theater__ball-spin">🏏</div>
          <p>Agents assembling…</p>
        </div>
      )}

      {/* Agent cards */}
      <div className="theater__cards">
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
      </div>
    </div>
  )
}
