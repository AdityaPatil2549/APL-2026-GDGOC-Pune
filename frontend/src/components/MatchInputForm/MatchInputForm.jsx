import { useState, useRef } from 'react'
import PillToggle from '../shared/PillToggle'
import NumericStepper from '../shared/NumericStepper'
import { IPL_TEAMS } from '../../constants/teams'
import { IPL_VENUES } from '../../constants/venues'
import './MatchInputForm.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DEFAULT_STATE = {
  innings: 2, over: 16, ball: 2,
  battingTeam: 'MI', bowlingTeam: 'CSK',
  score: 134, wickets: 4, target: 178,
  strikerName: 'Hardik Pandya', nonStrikerName: 'Tim David',
  bowlers: [
    { name: 'Deepak Chahar', oversUsed: 3 },
    { name: 'Tushar Deshpande', oversUsed: 3 },
    { name: 'Jadeja', oversUsed: 2 },
    { name: 'Matheesha Pathirana', oversUsed: 2 },
  ],
  pitchType: 'two-paced', dewFactor: 'heavy',
  venue: 'Wankhede Stadium, Mumbai',
  impactPlayerAvailable: true, powerplayActive: false, timeoutUsed: false,
}

function Label({ children, htmlFor }) {
  return <label className="form-label" htmlFor={htmlFor}>{children}</label>
}
function FormGroup({ label, htmlFor, children }) {
  return <div className="form-group">{label && <Label htmlFor={htmlFor}>{label}</Label>}{children}</div>
}
function SectionTitle({ children }) {
  return <div className="form-section-title">{children}</div>
}

export default function MatchInputForm({ onSubmit, locked }) {
  const [state, setState]           = useState(DEFAULT_STATE)
  const [errors, setErrors]         = useState({})
  const [cricbuzzUrl, setCricbuzzUrl] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlStatus, setUrlStatus]   = useState(null) // 'success' | 'error' | null
  const [dragOver, setDragOver]     = useState(false)
  const [visionLoading, setVisionLoading] = useState(false)
  const fileRef = useRef(null)

  const set = (key, val) => setState(s => ({ ...s, [key]: val }))

  const addBowler = () => {
    if (state.bowlers.length >= 5) return
    setState(s => ({ ...s, bowlers: [...s.bowlers, { name: '', oversUsed: 0 }] }))
  }
  const removeBowler = i => setState(s => ({ ...s, bowlers: s.bowlers.filter((_, idx) => idx !== i) }))
  const updateBowler = (i, key, val) => setState(s => ({
    ...s, bowlers: s.bowlers.map((b, idx) => idx === i ? { ...b, [key]: val } : b)
  }))

  const validate = () => {
    const e = {}
    if (state.over > 19)   e.over = 'Over must be 0–19'
    if (state.ball > 6)    e.ball = 'Ball must be 1–6'
    if (state.wickets > 10) e.wickets = 'Max 10'
    if (state.innings === 2 && !state.target) e.target = 'Target required'
    return e
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onSubmit(state)
  }

  // Real URL scrape via backend
  const handleScrapeUrl = async () => {
    if (!cricbuzzUrl.trim()) return
    setUrlLoading(true)
    setUrlStatus(null)
    try {
      const resp = await fetch(`${API_BASE}/api/scrape?url=${encodeURIComponent(cricbuzzUrl)}`)
      const data = await resp.json()
      if (data.success && data.matchState) {
        setState(prev => ({ ...prev, ...data.matchState, bowlers: data.matchState.bowlers || prev.bowlers }))
        setUrlStatus('success')
      } else {
        setUrlStatus('error')
      }
    } catch {
      setUrlStatus('error')
    } finally {
      setUrlLoading(false)
      setTimeout(() => setUrlStatus(null), 3000)
    }
  }

  // Vision / screenshot upload
  const handleVisionFile = async file => {
    if (!file) return
    setVisionLoading(true)
    setUrlStatus(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const resp = await fetch(`${API_BASE}/api/vision-extract`, { method: 'POST', body: formData })
      const data = await resp.json()
      if (data.success && data.matchState) {
        setState(prev => ({ ...prev, ...data.matchState, bowlers: data.matchState.bowlers || prev.bowlers }))
        setUrlStatus('success')
      } else {
        setUrlStatus('error')
      }
    } catch {
      setUrlStatus('error')
    } finally {
      setVisionLoading(false)
      setTimeout(() => setUrlStatus(null), 4000)
    }
  }

  const onDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleVisionFile(file)
  }

  return (
    <form
      className={`match-form ${locked ? 'match-form--locked' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      {locked && <div className="match-form__overlay"><span>🔄 Agents debating…</span></div>}

      {/* ── Vision drop zone ── */}
      <div
        className={`vision-drop ${dragOver ? 'vision-drop--over' : ''} ${visionLoading ? 'vision-drop--loading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !visionLoading && fileRef.current?.click()}
        id="vision-drop-zone"
        title="Drop a match screenshot to auto-fill"
      >
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleVisionFile(e.target.files[0])} />
        {visionLoading ? (
          <span className="vision-drop__text">🤖 Gemini reading screenshot…</span>
        ) : (
          <span className="vision-drop__text">
            {dragOver ? '📸 Drop to extract!' : '📸 Drop screenshot or click to upload'}
          </span>
        )}
      </div>

      {/* ── URL bar ── */}
      <div className="match-form__url-bar">
        <input
          id="cricbuzz-url"
          className={`form-input form-input--url ${urlStatus === 'success' ? 'form-input--ok' : urlStatus === 'error' ? 'form-input--err' : ''}`}
          type="url"
          placeholder="Paste Cricbuzz / ESPNCricinfo URL for auto-fill…"
          value={cricbuzzUrl}
          onChange={e => setCricbuzzUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScrapeUrl()}
          disabled={locked}
        />
        <button type="button" className="url-bar__btn" onClick={handleScrapeUrl}
          disabled={locked || urlLoading} id="paste-url-btn">
          {urlLoading ? '⏳' : urlStatus === 'success' ? '✓' : urlStatus === 'error' ? '✗ Retry' : '⚡ Fill'}
        </button>
      </div>

      {/* ── Match Context ── */}
      <SectionTitle>Match Context</SectionTitle>
      <FormGroup label="Innings">
        <PillToggle id="innings" options={[{ value: 1, label: '1st' }, { value: 2, label: '2nd' }]}
          value={state.innings} onChange={v => set('innings', v)} />
      </FormGroup>
      <div className="form-row">
        <FormGroup label="Over" htmlFor="over-stepper">
          <NumericStepper id="over-stepper" value={state.over} onChange={v => set('over', v)} min={0} max={19} label="Over" />
          {errors.over && <span className="form-error">{errors.over}</span>}
        </FormGroup>
        <FormGroup label="Ball" htmlFor="ball-stepper">
          <NumericStepper id="ball-stepper" value={state.ball} onChange={v => set('ball', v)} min={1} max={6} label="Ball" />
        </FormGroup>
      </div>
      <FormGroup label="Venue" htmlFor="venue-select">
        <select id="venue-select" className="form-select" value={state.venue} onChange={e => set('venue', e.target.value)}>
          {IPL_VENUES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </FormGroup>
      <FormGroup label="Pitch">
        <PillToggle id="pitch" options={[
          { value: 'flat', label: '🏟 Flat' },
          { value: 'two-paced', label: '⚡ Two-Paced' },
          { value: 'turning', label: '🌀 Turning' },
        ]} value={state.pitchType} onChange={v => set('pitchType', v)} />
      </FormGroup>
      <FormGroup label="Dew Factor">
        <PillToggle id="dew" options={[
          { value: 'none',  label: '☀ None' },
          { value: 'light', label: '🌢 Light' },
          { value: 'heavy', label: '💧 Heavy' },
        ]} value={state.dewFactor} onChange={v => set('dewFactor', v)} />
      </FormGroup>

      {/* ── Scoreboard ── */}
      <SectionTitle>Scoreboard</SectionTitle>
      <div className="form-row">
        <FormGroup label="Batting Team" htmlFor="batting-team">
          <select id="batting-team" className="form-select" value={state.battingTeam} onChange={e => set('battingTeam', e.target.value)}>
            {IPL_TEAMS.map(t => <option key={t.id} value={t.id}>{t.id} — {t.name}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Bowling Team" htmlFor="bowling-team">
          <select id="bowling-team" className="form-select" value={state.bowlingTeam} onChange={e => set('bowlingTeam', e.target.value)}>
            {IPL_TEAMS.map(t => <option key={t.id} value={t.id}>{t.id} — {t.name}</option>)}
          </select>
        </FormGroup>
      </div>
      <div className="form-row form-row--score">
        <FormGroup label="Runs" htmlFor="score-input">
          <input id="score-input" type="number" className="form-input" value={state.score} min={0} max={999}
            onChange={e => set('score', +e.target.value)} />
        </FormGroup>
        <span className="score-sep">/</span>
        <FormGroup label="Wickets" htmlFor="wickets-input">
          <input id="wickets-input" type="number" className="form-input" value={state.wickets} min={0} max={10}
            onChange={e => set('wickets', +e.target.value)} />
          {errors.wickets && <span className="form-error">{errors.wickets}</span>}
        </FormGroup>
        {state.innings === 2 && (
          <FormGroup label="Target" htmlFor="target-input">
            <input id="target-input" type="number" className="form-input form-input--target" value={state.target || ''}
              onChange={e => set('target', +e.target.value)} />
            {errors.target && <span className="form-error">{errors.target}</span>}
          </FormGroup>
        )}
      </div>
      <FormGroup label="Strike Batter" htmlFor="striker-input">
        <input id="striker-input" className="form-input" placeholder="e.g. Hardik Pandya"
          value={state.strikerName} onChange={e => set('strikerName', e.target.value)} />
      </FormGroup>
      <FormGroup label="Non-striker" htmlFor="nonstriker-input">
        <input id="nonstriker-input" className="form-input" placeholder="e.g. Tim David"
          value={state.nonStrikerName} onChange={e => set('nonStrikerName', e.target.value)} />
      </FormGroup>

      {/* ── Bowling ── */}
      <SectionTitle>Bowling State</SectionTitle>
      <div className="bowler-table">
        <div className="bowler-table__head">
          <span>Bowler</span><span>Overs Used</span><span>Left</span><span />
        </div>
        {state.bowlers.map((b, i) => (
          <div key={i} className="bowler-table__row">
            <input className="form-input form-input--sm" placeholder="Bowler name"
              value={b.name} onChange={e => updateBowler(i, 'name', e.target.value)} id={`bowler-name-${i}`} />
            <NumericStepper id={`bowler-overs-${i}`} value={b.oversUsed}
              onChange={v => updateBowler(i, 'oversUsed', v)} min={0} max={4} label={`Bowler ${i+1}`} />
            <span className={`bowler-table__left ${4-b.oversUsed===0?'bowler-table__left--done':''}`}>{4-b.oversUsed}</span>
            <button type="button" className="bowler-table__remove" onClick={() => removeBowler(i)} aria-label="Remove">×</button>
          </div>
        ))}
        {state.bowlers.length < 5 && (
          <button type="button" className="bowler-table__add" onClick={addBowler} id="add-bowler-btn">+ Add Bowler</button>
        )}
      </div>

      {/* ── Flags ── */}
      <SectionTitle>Match Flags</SectionTitle>
      <div className="flags-grid">
        {[
          { key: 'impactPlayerAvailable', label: '⭐ Impact Player', id: 'impact-toggle' },
          { key: 'powerplayActive',        label: '⚡ Powerplay Active', id: 'powerplay-toggle' },
          { key: 'timeoutUsed',            label: '⏱ Timeout Used', id: 'timeout-toggle' },
        ].map(f => (
          <button key={f.key} id={f.id} type="button"
            className={`flag-btn ${state[f.key] ? 'flag-btn--on' : ''}`}
            onClick={() => set(f.key, !state[f.key])}>
            {f.label}<span className="flag-btn__indicator">{state[f.key] ? 'YES' : 'NO'}</span>
          </button>
        ))}
      </div>

      {/* ── CTA ── */}
      <button id="strategize-btn" type="submit" className="strategize-btn" disabled={locked}>
        <span className="strategize-btn__shimmer" />
        <span className="strategize-btn__icon">⚡</span>
        STRATEGIZE
      </button>
    </form>
  )
}
