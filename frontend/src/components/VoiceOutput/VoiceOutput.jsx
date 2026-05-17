import { useState, useCallback } from 'react'
import './VoiceOutput.css'

export default function VoiceOutput({ text, disabled }) {
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState('speechSynthesis' in window)

  const speak = useCallback(() => {
    if (!text || !supported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    utterance.pitch = 1.05
    utterance.volume = 1

    // Pick a good voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google UK English Male') ||
      v.name.includes('Daniel') ||
      v.name.includes('Alex') ||
      v.lang === 'en-GB'
    ) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart  = () => setSpeaking(true)
    utterance.onend    = () => setSpeaking(false)
    utterance.onerror  = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [text, supported])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  if (!supported) return null

  return (
    <button
      id="voice-output-btn"
      className={`voice-btn ${speaking ? 'voice-btn--speaking' : ''}`}
      onClick={speaking ? stop : speak}
      disabled={disabled || !text}
      type="button"
      title={speaking ? 'Stop reading' : "Read Captain's Call aloud"}
    >
      <span className="voice-btn__icon">{speaking ? '⏹' : '🔊'}</span>
      <span className="voice-btn__label">{speaking ? 'STOP' : 'HEAR IT'}</span>
      {speaking && (
        <span className="voice-btn__bars">
          <span /><span /><span /><span />
        </span>
      )}
    </button>
  )
}
