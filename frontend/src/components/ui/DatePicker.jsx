import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const TZ = import.meta.env.VITE_TIMEZONE || 'UTC'

const getTodayStr = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())

const getNowInTz = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type) => parseInt(parts.find(p => p.type === type).value)
  return { year: get('year'), month: get('month') - 1 }
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const toDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const DatePicker = ({ value, onChange, placeholder = 'Select date', disabled = false }) => {
  const today = getTodayStr()
  const initial = value ? { year: parseInt(value.slice(0, 4)), month: parseInt(value.slice(5, 7)) - 1 } : getNowInTz()

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(initial.year)
  const [viewMonth, setViewMonth] = useState(initial.month)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, zIndex: 9999 })
    }
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const startOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)

  const handleDay = (day) => {
    onChange(toDateStr(viewYear, viewMonth, day))
    setOpen(false)
  }

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="relative inline-block w-full">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-full font-outfit text-base text-primary-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-input-border)' }}
      >
        <span className={displayValue ? '' : 'opacity-40'}>{displayValue ?? placeholder}</span>
        <Calendar size={14} className="shrink-0 opacity-40" />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="rounded-2xl shadow-lg p-4 w-64"
          style={{
            ...dropdownStyle,
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-input-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-full hover:opacity-60 transition-opacity"
            >
              <ChevronLeft size={16} style={{ color: 'var(--color-text)' }} />
            </button>
            <span className="font-outfit font-medium text-base" style={{ color: 'var(--color-text)' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-full hover:opacity-60 transition-opacity"
            >
              <ChevronRight size={16} style={{ color: 'var(--color-text)' }} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d, i) => (
              <div
                key={i}
                className="text-center font-outfit text-base py-1"
                style={{ color: 'var(--color-text)', opacity: 0.35 }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr = toDateStr(viewYear, viewMonth, day)
              const isSelected = value === dateStr
              const isToday = today === dateStr
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDay(day)}
                  className="w-8 h-8 mx-auto flex items-center justify-center rounded-full font-outfit text-base transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: 'var(--color-navy)', color: 'var(--color-bg)' }
                      : isToday
                      ? { color: 'var(--color-navy-accent)', fontWeight: 600 }
                      : { color: 'var(--color-text)' }
                  }
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.opacity = '0.6' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="mt-3 w-full text-center font-outfit text-base transition-opacity hover:opacity-60"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default DatePicker
