import { useEffect, useRef } from 'react'
import './Landing.css'

export default function Landing({ onEnter }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    // Particles: pitch dust
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.4,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    // Pitch lines radiating from center
    const lines = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.002,
    }))

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Background glow orbs
      const cx = W / 2, cy = H / 2
      const grd = ctx.createRadialGradient(cx, cy * 0.6, 0, cx, cy * 0.6, Math.min(W, H) * 0.7)
      grd.addColorStop(0, 'rgba(245,166,35,0.04)')
      grd.addColorStop(0.5, 'rgba(58,134,255,0.03)')
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)

      // Radiating pitch lines
      lines.forEach(l => {
        l.progress = (l.progress + l.speed) % 1
        const maxLen = Math.min(W, H) * 0.55
        const len = l.progress * maxLen
        const alpha = (1 - l.progress) * 0.18
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(l.angle) * len, cy + Math.sin(l.angle) * len)
        ctx.strokeStyle = `rgba(245,166,35,${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Particles
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,166,35,${p.alpha})`
        ctx.fill()
      })

      // Rotating cricket ball seam lines (2D projection)
      frame++
      const bx = cx, by = cy - 30
      const br = 52
      const rot = frame * 0.015

      // Ball gradient
      const ballGrd = ctx.createRadialGradient(bx - 12, by - 12, 4, bx, by, br)
      ballGrd.addColorStop(0, '#8B2020')
      ballGrd.addColorStop(0.5, '#6B1515')
      ballGrd.addColorStop(1, '#3D0A0A')
      ctx.beginPath()
      ctx.arc(bx, by, br, 0, Math.PI * 2)
      ctx.fillStyle = ballGrd
      ctx.fill()

      // Seam (horizontal ellipse rotating)
      ctx.save()
      ctx.translate(bx, by)
      ctx.rotate(rot)
      ctx.beginPath()
      ctx.ellipse(0, 0, br * 0.95, br * 0.15, 0, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,220,180,0.7)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(0, 0, br * 0.15, br * 0.95, 0, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,220,180,0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()

      // Ball highlight
      ctx.beginPath()
      ctx.arc(bx - 16, by - 16, 12, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.fill()

      // Outer glow ring
      const glowGrd = ctx.createRadialGradient(bx, by, br, bx, by, br + 30)
      glowGrd.addColorStop(0, 'rgba(245,166,35,0.15)')
      glowGrd.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(bx, by, br + 30, 0, Math.PI * 2)
      ctx.fillStyle = glowGrd
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="landing">
      <canvas ref={canvasRef} className="landing__canvas" />

      <div className="landing__content">
        {/* Logo */}
        <div className="landing__logo animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <span className="landing__logo-icon">🏏</span>
          <span className="landing__logo-text">CAPTAIN COOL</span>
        </div>

        {/* Hero headline */}
        <h1 className="landing__headline animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
          <span className="landing__headline-main">What would</span>
          <span className="landing__headline-dhoni">Dhoni</span>
          <span className="landing__headline-main">do?</span>
        </h1>

        {/* Sub-headline */}
        <p className="landing__subheadline animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          The AI captain that <em>debates before it decides.</em><br />
          4 Gemini agents. One war room. Zero hedging.
        </p>

        {/* Agent preview pills */}
        <div className="landing__agents animate-fadeInUp" style={{ animationDelay: '0.55s' }}>
          {[
            { emoji: '📊', label: 'Stats Analyst',    color: '#3A86FF' },
            { emoji: '🎯', label: 'Strategist',       color: '#F5A623' },
            { emoji: '😈', label: "Devil's Advocate", color: '#FF4757' },
            { emoji: '🎙️', label: 'Commentator',      color: '#2ED573' },
          ].map(a => (
            <div key={a.label} className="landing__agent-pill" style={{ '--agent-color': a.color }}>
              <span>{a.emoji}</span>
              <span>{a.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="landing__cta-group animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
          <button className="landing__cta" onClick={onEnter} id="enter-war-room-btn">
            <span className="landing__cta-shimmer" />
            <span className="landing__cta-icon">⚡</span>
            ENTER THE WAR ROOM
          </button>
          <button className="landing__secondary-btn" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
            How it works ↓
          </button>
        </div>

        {/* Gemini badge */}
        <div className="landing__badge animate-fadeInUp" style={{ animationDelay: '0.85s' }}>
          <span className="gemini-badge">
            Powered by <span>Gemini 2.5 Pro</span> · Built on Google ADK
          </span>
        </div>
      </div>

      {/* How it works section */}
      <div id="how-it-works" className="landing__how">
        <h2 className="landing__how-title">How It Works</h2>
        <div className="landing__steps">
          {[
            { n: '01', title: 'Set the Scene',     desc: 'Enter live match state — score, wickets, bowlers, pitch conditions — or paste a Cricbuzz URL.' },
            { n: '02', title: 'Agents Assemble',   desc: 'Stats Analyst fetches live data. Strategist proposes a decision. Devil\'s Advocate challenges it.' },
            { n: '03', title: "Captain's Call",    desc: 'After 2 debate rounds, the Commentator delivers the final verdict in cricket broadcast language.' },
          ].map(s => (
            <div key={s.n} className="landing__step">
              <div className="landing__step-num">{s.n}</div>
              <h3 className="landing__step-title">{s.title}</h3>
              <p className="landing__step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
        <button className="landing__cta landing__cta--sm" onClick={onEnter}>
          <span className="landing__cta-shimmer" />
          <span className="landing__cta-icon">⚡</span>
          START STRATEGIZING
        </button>
      </div>
    </div>
  )
}
