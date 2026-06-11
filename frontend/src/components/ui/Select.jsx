import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = ({ value, onChange, options, placeholder = 'Select...', disabled = false }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 z-50 mt-1 w-full min-w-max rounded-2xl overflow-hidden shadow-lg"
          style={{ backgroundColor: '#E1DFD5', border: '1px solid #BEBCB3' }}
        >
          {options.map((option) => (
            <button
              key={option.value ?? '__placeholder__'}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2.5 font-outfit text-sm transition-colors hover:bg-black/5"
              style={
                value === option.value
                  ? { backgroundColor: '#233970', color: '#F5F3EA' }
                  : { color: '#1A1A2E' }
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Select
