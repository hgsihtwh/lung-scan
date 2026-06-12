import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { PageLayout } from '@/components/layout'
import { useAuthStore } from '@/store'
import { getScansHistory, getPatientHistory } from '@/api'
import { formatDate } from '@/utils/helpers'
import ComparePane from '@/components/dynamics/ComparePane'
import { initCornerstone } from '@/utils/cornerstone'

const VerdictDot = ({ cx, cy, payload, selected, onToggle }) => {
  if (cx == null || cy == null) return null
  const isSelected = selected.includes(payload.id)
  const color = payload.verdict === 'Normal' ? '#1F7819' : payload.verdict ? '#7E2F2F' : '#9CA3AF'
  return (
    <circle
      cx={cx} cy={cy}
      r={isSelected ? 8 : 6}
      fill={color}
      stroke={isSelected ? '#233970' : 'white'}
      strokeWidth={2}
      style={{ cursor: 'pointer' }}
      onClick={() => onToggle(payload.id)}
    />
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const verdictColor = d.verdict === 'Normal' ? '#1F7819' : d.verdict ? '#7E2F2F' : '#9CA3AF'
  return (
    <div className="rounded-xl px-4 py-3 shadow-lg" style={{ backgroundColor: '#EFEDE3' }}>
      <p className="font-outfit font-medium text-sm text-primary-dark">{d.date}</p>
      <p className="font-outfit text-sm text-primary-dark opacity-70">
        Pathology probability: {d.probability}%
      </p>
      {d.verdict && (
        <p className="font-outfit text-sm" style={{ color: verdictColor }}>
          {d.verdict}
        </p>
      )}
    </div>
  )
}

const DynamicsPage = () => {
  const { patientId } = useParams()
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    initCornerstone()
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = patientId
        ? await getPatientHistory(token, patientId)
        : await getScansHistory(token)
      if (result.success) setHistory(result.data.items)
      setLoading(false)
    }
    load()
  }, [token, patientId])

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const chartData = history
    .filter((s) => s.probability != null)
    .map((s) => ({
      id: s.id,
      date: formatDate(s.created_at),
      probability: Math.round(
        (s.verdict === 'Normal' ? 1 - s.probability : s.probability) * 100
      ),
      verdict: s.verdict,
    }))

  if (comparing && selected.length === 2) {
    return (
      <PageLayout>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">
          <button
            onClick={() => setComparing(false)}
            className="font-outfit text-sm text-primary-dark opacity-60 hover:opacity-100 transition-opacity mb-8 flex items-center gap-2"
          >
            ← Back to dynamics
          </button>
          <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark mb-10 sm:mb-12">
            COMPARE
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ComparePane scanId={selected[0]} />
            <ComparePane scanId={selected[1]} />
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-24 sm:pt-32 lg:pt-[150px] pb-12 sm:pb-16 md:pb-20">
        <button
          onClick={() => navigate(-1)}
          className="font-outfit text-sm text-primary-dark opacity-60 hover:opacity-100 transition-opacity mb-8 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8 sm:mb-10 lg:mb-[50px]">
          <h2 className="font-outfit font-semibold text-3xl sm:text-4xl md:text-[45px] text-primary-dark">
            DYNAMICS
          </h2>
          {selected.length === 2 && (
            <button
              onClick={() => setComparing(true)}
              className="px-6 py-3 rounded-full font-outfit font-medium text-sm transition-colors"
              style={{ backgroundColor: '#233970', color: '#F5F3EA' }}
            >
              Compare studies
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy mx-auto mb-4" />
            <p className="font-outfit text-primary-dark">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <p className="font-outfit text-primary-dark opacity-60 py-12">No scan history available.</p>
        ) : (
          <>
            {chartData.length > 1 && (
              <div className="rounded-2xl p-6 mb-10" style={{ backgroundColor: '#EFEDE3' }}>
                <p className="font-outfit font-medium text-base text-primary-dark mb-6">
                  Pathology probability over time
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D2D1C8" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontFamily: 'Outfit', fontSize: 12, fill: '#787771' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      tick={{ fontFamily: 'Outfit', fontSize: 12, fill: '#787771' }}
                    />
                    <ReferenceLine y={50} stroke="#BEBCB3" strokeDasharray="4 4" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="probability"
                      stroke="#233970"
                      strokeWidth={2}
                      activeDot={false}
                      dot={(props) => (
                        <VerdictDot
                          key={props.payload.id}
                          {...props}
                          selected={selected}
                          onToggle={toggleSelect}
                        />
                      )}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="font-outfit text-xs mt-4" style={{ color: '#787771' }}>
                  Click a point to select a study for comparison
                </p>
              </div>
            )}

            {selected.length === 1 && (
              <p className="font-outfit text-sm text-primary-dark opacity-60 mb-4">
                Select one more study to compare
              </p>
            )}

            <div className="space-y-3">
              {history.map((scan, index) => {
                const isSelected = selected.includes(scan.id)
                const isDisabled = selected.length >= 2 && !isSelected
                const verdictColor = scan.verdict === 'Normal'
                  ? '#1F7819'
                  : scan.verdict ? '#7E2F2F' : '#9CA3AF'

                return (
                  <div
                    key={scan.id}
                    className="rounded-2xl p-5 flex items-center justify-between transition-all"
                    style={{
                      backgroundColor: isSelected ? '#233970' : '#EFEDE3',
                      opacity: isDisabled ? 0.4 : 1,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="font-outfit text-sm font-medium w-6 text-center"
                        style={{ color: isSelected ? '#F5F3EA' : '#787771' }}
                      >
                        #{index + 1}
                      </span>
                      <div>
                        <p
                          className="font-outfit font-medium text-sm"
                          style={{ color: isSelected ? '#F5F3EA' : '#1A1A1A' }}
                        >
                          {formatDate(scan.created_at)}
                        </p>
                        <p
                          className="font-outfit text-xs mt-0.5"
                          style={{ color: isSelected ? '#D2D1C8' : '#787771' }}
                        >
                          {scan.slice_count} slices
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p
                          className="font-outfit font-medium text-sm"
                          style={{ color: isSelected ? '#F5F3EA' : verdictColor }}
                        >
                          {scan.verdict ?? 'Not analyzed'}
                        </p>
                        {scan.probability != null && (
                          <p
                            className="font-outfit text-xs mt-0.5"
                            style={{ color: isSelected ? '#D2D1C8' : '#787771' }}
                          >
                            {(scan.probability * 100).toFixed(0)}% probability
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => toggleSelect(scan.id)}
                        disabled={isDisabled}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                        style={{
                          border: isSelected ? '2px solid #F5F3EA' : '2px solid #BEBCB3',
                          backgroundColor: isSelected ? '#F5F3EA' : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6L5 9L10 3"
                              stroke="#233970"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default DynamicsPage
