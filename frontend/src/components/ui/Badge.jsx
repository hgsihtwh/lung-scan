const variants = {
  success: {
    bg: '#DCFCE7',
    text: '#1F7819',
  },
  danger: {
    bg: '#FEE2E2',
    text: '#7E2F2F',
  },
  warning: {
    bg: '#FEF3C7',
    text: '#92400E',
  },
  neutral: {
    bg: '#E5E7EB',
    text: '#6B7280',
  },
}

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const colors = variants[variant] || variants.neutral

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-outfit text-sm font-medium ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {children}
    </span>
  )
}

export default Badge
