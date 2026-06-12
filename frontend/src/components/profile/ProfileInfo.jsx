import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuthStore, useScanStore, useUIStore } from '@/store'
import { changePassword } from '@/api'

const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block font-outfit font-normal text-base text-primary-dark opacity-60 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 rounded-full font-outfit text-base focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--color-border)',
          }}
          required
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark opacity-60 hover:opacity-100 transition-opacity"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

const ProfileInfo = () => {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const { resetScan } = useScanStore()
  const { resetUI } = useUIStore()

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [fields, setFields] = useState({ current: '', next: '', confirm: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignOut = () => {
    logout()
    resetScan()
    resetUI()
    navigate('/')
  }

  const handleChange = (e) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess(false)
  }

  const handleCancel = () => {
    setIsChangingPassword(false)
    setFields({ current: '', next: '', confirm: '' })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (fields.next !== fields.confirm) {
      setError('New password and confirmation do not match')
      return
    }
    setIsLoading(true)
    setError('')
    const result = await changePassword(fields.current, fields.next, token)
    setIsLoading(false)
    if (!result.success) {
      setError(result.error || 'Failed to change password')
      return
    }
    setSuccess(true)
    setFields({ current: '', next: '', confirm: '' })
    setTimeout(() => {
      setIsChangingPassword(false)
      setSuccess(false)
    }, 2000)
  }

  return (
    <div className="max-w-[300px] mb-32 sm:mb-40 lg:mb-[200px]">
      <p className="font-outfit font-normal text-lg text-primary-dark opacity-60 mb-1">EMAIL</p>
      <p className="font-outfit font-normal text-base text-primary-dark mb-6">{user?.email}</p>

      {!isChangingPassword ? (
        <button
          onClick={() => setIsChangingPassword(true)}
          className="font-outfit font-normal text-base text-primary-dark opacity-50 hover:opacity-100 transition-opacity mb-6 block"
        >
          Change password
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <PasswordInput
            label="CURRENT PASSWORD"
            name="current"
            value={fields.current}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <PasswordInput
            label="NEW PASSWORD"
            name="next"
            value={fields.next}
            onChange={handleChange}
            placeholder="••••••••"
          />
          <PasswordInput
            label="CONFIRM PASSWORD"
            name="confirm"
            value={fields.confirm}
            onChange={handleChange}
            placeholder="••••••••"
          />

          {error && <p className="font-outfit text-base text-red-500">{error}</p>}
          {success && <p className="font-outfit text-base text-green-600">Password changed successfully</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-10 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 h-10 font-outfit font-normal text-base text-primary-dark opacity-50 hover:opacity-100 transition-opacity rounded-full"
              style={{ border: '1px solid var(--color-border)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <button
        onClick={handleSignOut}
        className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors"
      >
        SIGN OUT
      </button>
    </div>
  )
}

export default ProfileInfo
