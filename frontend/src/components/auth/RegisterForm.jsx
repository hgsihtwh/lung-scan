import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const RegisterForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
          EMAIL
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="user@example.com"
          className="w-full px-4 py-3 rounded-full font-outfit text-base focus:outline-none transition-colors"
          style={{
            backgroundColor: '#E1DFD5',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#BEBCB3',
          }}
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
          PASSWORD
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-full font-outfit text-base focus:outline-none transition-colors"
            style={{
              backgroundColor: '#E1DFD5',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#BEBCB3',
            }}
            required
            minLength={4}
            maxLength={72}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark opacity-60 hover:opacity-100 transition-opacity"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
          CONFIRM PASSWORD
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 rounded-full font-outfit text-base focus:outline-none transition-colors"
            style={{
              backgroundColor: '#E1DFD5',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#BEBCB3',
            }}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark opacity-60 hover:opacity-100 transition-opacity"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="font-outfit text-sm text-red-600">{error}</div>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'SIGN UP'}
      </button>
    </form>
  )
}

export default RegisterForm
