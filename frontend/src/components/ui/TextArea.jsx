const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  maxLength,
  disabled = false,
  className = '',
  hint,
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
          {label}
        </label>
      )}

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className={`
          w-full p-3 lg:p-4 rounded-xl font-outfit text-sm lg:text-base 
          resize-none focus:outline-none transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
        `}
        style={{
          backgroundColor: '#E1DFD5',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: error ? '#EF4444' : '#BEBCB3',
        }}
        {...props}
      />

      {/* Hint or character count */}
      <div className="flex justify-between mt-1">
        {hint && <p className="font-outfit text-xs text-primary-dark opacity-60">{hint}</p>}
        {maxLength && (
          <p className="font-outfit text-xs text-primary-dark opacity-60">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>

      {/* Error message */}
      {error && <p className="font-outfit text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default TextArea
