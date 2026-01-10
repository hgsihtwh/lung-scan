const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

const LoadingSpinner = ({
  size = 'md',
  color = 'primary-navy',
  text,
  fullScreen = false,
  className = '',
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-${color} ${sizes[size]}`} />
      {text && <p className="font-outfit text-lg text-primary-dark mt-4">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center">{spinner}</div>
  }

  return spinner
}

export default LoadingSpinner
