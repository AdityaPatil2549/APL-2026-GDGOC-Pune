import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AGENTS } from '../../constants/agents'
import './AgentCard.css'

function TypingDots({ agentColor }) {
  return (
    <div className="typing-indicator">
      <span style={{ '--dot-color': agentColor }} />
      <span style={{ '--dot-color': agentColor }} />
      <span style={{ '--dot-color': agentColor }} />
    </div>
  )
}

function StreamingMarkdown({ text, isDone }) {
  if (isDone) {
    return (
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    )
  }
  // While streaming, word-by-word animation on raw text
  const words = text.split(/(\s+)/)
  return (
    <p className="agent-card__text">
      {words.map((w, i) => (
        <span key={i} className="word" style={{ animationDelay: `${Math.min(i * 12, 400)}ms` }}>{w}</span>
      ))}
    </p>
  )
}

export default function AgentCard({ agentId, message, status, badge, toolCall, delay = 0 }) {
  const agent = AGENTS[agentId]
  if (!agent) return null

  const isActive   = status === 'thinking' || status === 'streaming'
  const isDone     = status === 'complete'
  const isThinking = status === 'thinking'

  return (
    <div
      className={`agent-card ${isActive ? 'agent-card--active' : ''} ${isDone ? 'agent-card--done' : ''}`}
      style={{
        '--agent-color': agent.color,
        '--agent-glow':  `${agent.color}50`,
        animationDelay:  `${delay}ms`,
      }}
    >
      {/* Top accent line */}
      <div className="agent-card__accent-line" />

      {/* Header */}
      <div className="agent-card__header">
        <div className="agent-card__avatar" style={{ background: agent.avatarBg }}>
          <span className="agent-card__emoji">{agent.emoji}</span>
          {isActive && <span className="agent-card__pulse" />}
        </div>
        <div className="agent-card__meta">
          <div className="agent-card__name">{agent.name}</div>
          <div className="agent-card__tagline">{agent.tagline}</div>
        </div>
        <div className="agent-card__status-area">
          {isActive && <span className="live-dot" />}
          {badge && (
            <span className={`badge badge-${
              badge === 'CHALLENGED' ? 'coral' :
              badge === 'REVISED'    ? 'gold'  :
              badge === 'DEFENDED ✓' ? 'green' :
              badge === 'TOOL CALL'  ? 'blue'  : 'gold'
            }`}>{badge}</span>
          )}
          {isDone && <span className="agent-card__check">✓</span>}
        </div>
      </div>

      {/* Tool call visualization */}
      {toolCall && (
        <div className="agent-card__tool-call">
          <div className="tool-call__header">
            <span className="badge badge-blue">🔗 TOOL CALL</span>
            <span className="tool-call__source">{toolCall.source}</span>
          </div>
          <div className="tool-call__label">{toolCall.label}</div>
          <div className="tool-call__progress-track">
            <div
              className="tool-call__progress-fill"
              style={{ width: `${toolCall.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="agent-card__body">
        {isThinking && !message && <TypingDots agentColor={agent.color} />}
        {message && <StreamingMarkdown text={message} isDone={isDone} />}
      </div>
    </div>
  )
}
