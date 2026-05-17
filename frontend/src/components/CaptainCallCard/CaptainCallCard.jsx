import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ConfidenceBar from '../shared/ConfidenceBar'
import WinProbGauge from '../shared/WinProbGauge'
import VoiceOutput from '../VoiceOutput/VoiceOutput'
import './CaptainCallCard.css'

export default function CaptainCallCard({ captainsCall, onRedebate }) {
  const [copied, setCopied]   = useState(false)
  const [dissent, setDissent] = useState(false)

  if (!captainsCall) return null

  const {
    decision, fieldSetup, reasoning, confidence,
    winProbBefore, winProbAfter, counterfactual, commentaryOutput
  } = captainsCall

  const confPct = Math.round(confidence * 100)
  const confColor =
    confPct >= 80 ? 'var(--green)' :
    confPct >= 60 ? 'var(--rrr-mid)' : 'var(--coral)'

  const borderClass =
    confPct >= 80 ? 'call-card--high' :
    confPct >= 60 ? 'call-card--mid'  : 'call-card--low'

  const voiceText = [
    `Captain's Call: ${decision}.`,
    commentaryOutput || reasoning || '',
    counterfactual ? `The dissent said: ${counterfactual.slice(0, 200)}` : '',
    `Confidence: ${confPct} percent. Win probability moves from ${winProbBefore} to ${winProbAfter} percent.`
  ].filter(Boolean).join(' ')

  const copy = () => {
    const text = `🏏 CAPTAIN'S CALL\n${decision}\n\n${reasoning}\n\nConfidence: ${confPct}%\nWin Probability: ${winProbBefore}% → ${winProbAfter}%\n\nCounterfactual: ${counterfactual}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const share = () => {
    const text = `🏏 Captain Cool just made the call!\n\n"${decision}"\n\nConfidence: ${confPct}% | Win prob: ${winProbBefore}% → ${winProbAfter}%\n\nPowered by Gemini 2.5 Pro 🤖\n#CaptainCool #IPL #GeminiHackathon`
    if (navigator.share) {
      navigator.share({ title: "Captain's Call", text })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const bodyText = commentaryOutput || reasoning || ''

  return (
    <div className={`call-card ${borderClass} animate-slideInRight`}>
      <div className="call-card__glow" />

      {/* Header */}
      <div className="call-card__header">
        <div className="call-card__icon-wrap">
          <span className="call-card__icon">🏏</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="call-card__label">CAPTAIN'S CALL</div>
          <div className="call-card__decision">{decision}</div>
        </div>
        <VoiceOutput text={voiceText} />
      </div>

      <div className="divider" />

      {/* Field Setup */}
      {fieldSetup && fieldSetup !== 'See full reasoning below' && (
        <div className="call-card__section">
          <span className="call-card__section-label">FIELD SETUP</span>
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{fieldSetup}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Reasoning — rendered as Markdown */}
      {bodyText && (
        <div className="call-card__section call-card__reasoning-section">
          <span className="call-card__section-label">REASONING</span>
          <blockquote className="call-card__reasoning-block">
            <div className="prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyText}</ReactMarkdown>
            </div>
          </blockquote>
        </div>
      )}

      <div className="divider" />

      <ConfidenceBar value={confPct} color={confColor} label="CONFIDENCE SCORE" />
      <div className="divider" />
      <WinProbGauge before={winProbBefore} after={winProbAfter} />

      {/* Counterfactual / dissent */}
      {counterfactual && (
        <>
          <div className="divider" />
          <div className="call-card__dissent">
            <button
              className="call-card__dissent-toggle"
              onClick={() => setDissent(d => !d)}
              type="button"
            >
              <span>😈 Devil's argument</span>
              <span className={`dissent-arrow ${dissent ? 'dissent-arrow--open' : ''}`}>▼</span>
            </button>
            {dissent && (
              <div className="call-card__dissent-body animate-fadeInUp">
                <div className="prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{counterfactual}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="divider" />

      {/* Actions */}
      <div className="call-card__actions">
        <button id="copy-decision-btn" className="call-card__btn call-card__btn--copy" onClick={copy} type="button">
          {copied ? '✓ COPIED!' : '📋 COPY'}
        </button>
        <button id="share-decision-btn" className="call-card__btn call-card__btn--share" onClick={share} type="button">
          🚀 SHARE
        </button>
        <button id="redebate-btn" className="call-card__btn call-card__btn--redebate" onClick={onRedebate} type="button">
          🔄 RE-DEBATE
        </button>
      </div>
    </div>
  )
}
