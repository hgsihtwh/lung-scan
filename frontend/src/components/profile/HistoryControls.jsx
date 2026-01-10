import { Filter, ArrowUpDown } from 'lucide-react'

const HistoryControls = ({ sortOrder, onSortChange }) => {
  const handleSort = () => {
    onSortChange(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={handleSort}
        className="p-2 hover:opacity-70 transition-opacity"
        title={sortOrder === 'desc' ? 'Sorted: Newest first' : 'Sorted: Oldest first'}
      >
        <ArrowUpDown
          size={20}
          className={`text-primary-dark ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
        />
      </button>

      <button className="p-2 hover:opacity-70 transition-opacity" title="Filter (coming soon)">
        <Filter size={20} className="text-primary-dark" />
      </button>
    </div>
  )
}

export default HistoryControls
