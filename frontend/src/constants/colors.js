export const COLORS = {
  // Primary
  primary: {
    beige: 'var(--color-bg)',
    dark: 'var(--color-text)',
    navy: 'var(--color-navy)',
    navyDark: 'var(--color-navy-dark)',
  },

  // Status
  status: {
    normal: '#1F7819',
    pathology: '#7E2F2F',
    pending: '#9CA3AF',
  },

  // UI
  ui: {
    inputBg: 'var(--color-surface)',
    inputBorder: 'var(--color-border)',
    cardBg: 'var(--color-bg)',
    textMuted: 'var(--color-text-muted)',
    sliderTrack: 'var(--color-chart-grid)',
    sliderThumb: 'var(--color-text-muted)',
  },

  // Feedback
  feedback: {
    success: '#1F7819',
    error: '#7E2F2F',
    warning: '#92400E',
  },
}

// Tailwind-совместимые классы
export const STATUS_COLORS = {
  Normal: {
    text: 'text-[#1F7819]',
    bg: 'bg-[#DCFCE7]',
  },
  Pathology: {
    text: 'text-[#7E2F2F]',
    bg: 'bg-[#FEE2E2]',
  },
  pending: {
    text: 'text-gray-400',
    bg: 'bg-gray-100',
  },
}
