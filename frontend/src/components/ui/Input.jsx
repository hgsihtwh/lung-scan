import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rightElement,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={className}>
      {label && (
        <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 rounded-full font-outfit text-base 
            focus:outline-none transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isPassword || rightElement ? 'pr-12' : ''}
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

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark opacity-60 hover:opacity-100 transition-opacity"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* Custom right element */}
        {rightElement && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="font-outfit text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default Input
