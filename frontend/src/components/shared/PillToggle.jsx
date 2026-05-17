import './PillToggle.css'

export default function PillToggle({ options, value, onChange, id }) {
  return (
    <div className="pill-toggle" role="group" aria-label={id}>
      {options.map(opt => (
        <button
          key={opt.value}
          id={`${id}-${opt.value}`}
          className={`pill-toggle__option ${value === opt.value ? 'pill-toggle__option--active' : ''}`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.emoji && <span>{opt.emoji}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
