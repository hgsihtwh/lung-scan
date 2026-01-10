const variants = {
  primary: 'bg-primary-navy text-primary-beige hover:bg-primary-navyDark',
  secondary:
    'bg-transparent text-primary-dark border border-primary-dark hover:bg-primary-dark hover:bg-opacity-5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-primary-dark hover:opacity-70',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 sm:h-11 md:h-12 px-4 text-[15px]',
  lg: 'h-12 sm:h-14 px-6 text-base',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-outfit font-normal rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'

  const widthStyles = fullWidth ? 'w-full' : ''

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={18} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={18} />}
        </>
      )}
    </button>
  )
}

export default Button
