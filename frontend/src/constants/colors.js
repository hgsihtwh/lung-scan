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
    normal: '#003DD6',
    pathology: 'var(--color-text)',
    pending: 'var(--color-text-muted)',
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
    success: '#003DD6',
    error: 'var(--color-text)',
    warning: 'var(--color-text-muted)',
  },
}

// Tailwind-совместимые классы
export const STATUS_COLORS = {
  Normal: {
    text: 'text-[#003DD6]',
    bg: 'bg-[rgba(0,61,214,0.08)]',
  },
  Pathology: {
    text: 'text-primary-dark',
    bg: 'bg-[rgba(20,20,20,0.06)]',
  },
  pending: {
    text: 'text-primary-dark opacity-40',
    bg: 'bg-transparent',
  },
}
