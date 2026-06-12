import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  searchable = false,
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open, searchable])

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const selected = options.find((o) => o.value === value)

  const handleToggle = () => {
    if (disabled) return
    setOpen((v) => !v)
    if (open) setSearch('')
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-input-border)' }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 z-50 mt-1 w-full min-w-max rounded-2xl shadow-lg overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-input-border)' }}
        >
          {searchable && (
            <div className="px-3 pt-2 pb-1">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-1.5 rounded-full font-outfit text-sm text-primary-dark focus:outline-none"
                style={{ backgroundColor: 'var(--color-overlay-subtle)' }}
              />
            </div>
          )}

          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-2.5 font-outfit text-sm text-primary-dark opacity-50">
                Not found
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value ?? '__empty__'}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className="w-full text-left px-4 py-2.5 font-outfit text-sm transition-colors hover:bg-black/5"
                  style={
                    value === option.value
                      ? { backgroundColor: 'var(--color-navy-accent)', color: 'var(--color-surface-alt)' }
                      : { color: 'var(--color-text)' }
                  }
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Select
