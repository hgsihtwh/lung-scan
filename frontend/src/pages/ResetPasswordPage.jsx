import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '@/api'
import { PageLayout } from '@/components/layout'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <PageLayout>
        <div className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-36 sm:pt-44 lg:pt-[200px] pb-12 sm:pb-16 md:pb-20 w-full">
          <div className="max-w-[400px]">
            <h2 className="font-outfit text-[45px] font-semibold text-primary-dark mb-12">RESET</h2>
            <div className="border-2 border-primary-dark rounded-2xl p-8 bg-primary-beige">
              <p className="font-outfit text-sm text-red-600 mb-6">
                Invalid or missing reset link. Please request a new one.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors"
              >
                BACK TO SIGN IN
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    if (newPassword.length > 72) {
      setError('Password is too long (max 72 characters)')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await resetPassword(token, newPassword)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setSuccess(true)
  }

  return (
    <PageLayout>
      <div className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-[80px] pt-36 sm:pt-44 lg:pt-[200px] pb-12 sm:pb-16 md:pb-20 w-full">
        <div className="max-w-[400px]">
          <div className="mb-12">
            <h2 className="font-outfit text-[45px] font-semibold text-primary-dark">RESET</h2>
          </div>

          <div className="border-2 border-primary-dark rounded-2xl p-8 bg-primary-beige">
            {success ? (
              <div className="space-y-6">
                <p className="font-outfit text-sm text-primary-dark opacity-70">
                  Your password has been successfully reset.
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors"
                >
                  SIGN IN
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 rounded-full font-outfit text-base focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'var(--color-border)',
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

                <div>
                  <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
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
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-dark opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && <div className="font-outfit text-sm text-red-600">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'SET NEW PASSWORD'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default ResetPasswordPage
