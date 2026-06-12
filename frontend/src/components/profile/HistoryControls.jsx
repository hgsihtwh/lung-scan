import { ArrowUpDown, Search } from 'lucide-react'

const VERDICT_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Normal', value: 'Normal' },
  { label: 'Abnormal', value: 'Pathology' },
]

const HistoryControls = ({ search, onSearchChange, verdict, onVerdictChange, sortOrder, onSortChange, noPatient, onNoPatientChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
      {onSearchChange && (
        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark opacity-40 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by patient email"
            className="w-full pl-9 pr-3 py-2 text-base font-outfit bg-transparent border border-primary-dark/20 rounded-full focus:outline-none focus:border-primary-navy text-primary-dark placeholder:opacity-40"
          />
        </div>
      )}

      <div className="flex items-center gap-1">
        {VERDICT_OPTIONS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => onVerdictChange(value)}
            className={`px-3 py-1.5 text-base font-outfit rounded-full transition-colors ${
              verdict === value
                ? 'bg-primary-navy text-primary-beige'
                : 'text-primary-dark opacity-60 hover:opacity-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {onNoPatientChange && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span
            onClick={() => onNoPatientChange(!noPatient)}
            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ borderColor: 'var(--color-navy-accent)', backgroundColor: noPatient ? 'var(--color-navy-accent)' : 'transparent' }}
          >
            {noPatient && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
          </span>
          <span
            onClick={() => onNoPatientChange(!noPatient)}
            className="font-outfit text-base text-primary-dark opacity-60 hover:opacity-100 transition-opacity"
          >
            Without patient
          </span>
        </label>
      )}

      <button
        onClick={() => onSortChange(sortOrder === 'desc' ? 'asc' : 'desc')}
        className="p-2 hover:opacity-70 transition-opacity"
        title={sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
      >
        <ArrowUpDown
          size={20}
          className={`text-primary-dark transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}

export default HistoryControls
