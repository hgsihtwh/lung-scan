const sizes = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
}

const variants = {
  default: 'bg-primary-beige hover:bg-opacity-80 shadow-sm',
  ghost: 'bg-transparent hover:bg-primary-dark hover:bg-opacity-10',
  outline: 'bg-transparent border border-primary-dark hover:bg-primary-dark hover:bg-opacity-5',
}

const IconButton = ({
  icon: Icon,
  size = 'md',
  variant = 'default',
  iconSize = 18,
  disabled = false,
  className = '',
  title,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      title={title}
      className={`
        rounded-md transition-all 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]} 
        ${variants[variant]} 
        ${className}
      `}
      {...props}
    >
      <Icon size={iconSize} className="text-primary-navy" />
    </button>
  )
}

export default IconButton
