import './NumericStepper.css'

export default function NumericStepper({ value, onChange, min = 0, max = 99, label, id }) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))
  return (
    <div className="stepper" id={id}>
      <button className="stepper__btn" onClick={dec} type="button" aria-label={`Decrease ${label}`}>−</button>
      <div className="stepper__value">
        <span className="stepper__num">{String(value).padStart(2, '0')}</span>
      </div>
      <button className="stepper__btn" onClick={inc} type="button" aria-label={`Increase ${label}`}>+</button>
    </div>
  )
}
