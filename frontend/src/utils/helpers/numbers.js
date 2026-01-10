export const formatProbability = (probability, decimals = 1) => {
  if (probability === null || probability === undefined) return 'N/A'

  const percentage = probability * 100
  return `${percentage.toFixed(decimals)}%`
}

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

export const roundTo = (value, decimals = 2) => {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export const inRange = (value, min, max) => {
  return value >= min && value <= max
}
