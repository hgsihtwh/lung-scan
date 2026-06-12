import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login, verifyCode, resendCode, forgotPassword, getMe } from '@/api'
import { useAuthStore } from '@/store'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import VerifyCodeForm from './VerifyCodeForm'
import ForgotPasswordForm from './ForgotPasswordForm'

const AuthForm = () => {
  const navigate = useNavigate()
  const { login: saveAuth } = useAuthStore()

  const [mode, setMode] = useState('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)

  const validateForm = (formData) => {
    const { email, password, confirmPassword } = formData

    if (!email) return 'Email is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Invalid email format'

    if (!password) return 'Password is required'
    if (password.length < 4) return 'Password must be at least 4 characters'
    if (password.length > 72) return 'Password is too long (max 72 characters)'

    if (mode === 'signup') {
      if (!confirmPassword) return 'Please confirm your password'
      if (password !== confirmPassword) return 'Passwords do not match'
    }

    return null
  }

  const handleLogin = async (formData) => {
    setError('')

    const validationError = validateForm(formData)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      const token = result.data.access_token
      const meResult = await getMe(token)
      const role = meResult.success ? meResult.data.role : 'patient'
      saveAuth(token, formData.email, role)
      navigate('/')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleRegister = async (formData) => {
    setError('')

    const validationError = validateForm(formData)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const registerResult = await register(formData.email, formData.password)

      if (!registerResult.success) {
        setError(registerResult.error)
        setLoading(false)
        return
      }

      setPendingEmail(formData.email)
      setMode('verify')
      setLoading(false)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleVerify = async (code) => {
    setError('')
    setLoading(true)

    try {
      const verifyResult = await verifyCode(pendingEmail, code)

      if (!verifyResult.success) {
        setError(verifyResult.error)
        setLoading(false)
        return
      }

      const token = verifyResult.data.access_token
      const meResult = await getMe(token)
      const role = meResult.success ? meResult.data.role : 'patient'
      saveAuth(token, pendingEmail, role)
      navigate('/')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (email) => {
    setError('')
    setLoading(true)
    const result = await forgotPassword(email)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setForgotSuccess(true)
  }

  const handleResendCode = async () => {
    setError('')
    const result = await resendCode(pendingEmail)
    if (!result.success) {
      setError(result.error)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setPendingEmail('')
    setForgotSuccess(false)
  }

  return (
    <div className="max-w-[400px]">
      {/* Mode Switcher — скрываем на шагах verify и forgot */}
      {mode !== 'verify' && mode !== 'forgot' && (
        <div className="flex gap-8 mb-12">
          <button
            onClick={() => switchMode('signin')}
            className={`font-outfit text-3xl font-semibold transition-colors relative ${
              mode === 'signin' ? 'text-primary-dark' : 'text-gray-400'
            }`}
          >
            SIGN IN
            {mode === 'signin' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark"></div>
            )}
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`font-outfit text-3xl font-semibold transition-colors relative ${
              mode === 'signup' ? 'text-primary-dark' : 'text-gray-400'
            }`}
          >
            SIGN UP
            {mode === 'signup' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark"></div>
            )}
          </button>
        </div>
      )}

      {mode === 'verify' && (
        <div className="mb-12">
          <h2 className="font-outfit text-3xl font-semibold text-primary-dark">VERIFY</h2>
        </div>
      )}

      {mode === 'forgot' && (
        <div className="mb-12">
          <h2 className="font-outfit text-3xl font-semibold text-primary-dark">RESET</h2>
        </div>
      )}

      {/* Form Container */}
      <div className="card rounded-2xl p-8 bg-primary-beige">
        {mode === 'signin' && (
          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={() => switchMode('forgot')}
            loading={loading}
            error={error}
          />
        )}
        {mode === 'signup' && (
          <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
        )}
        {mode === 'verify' && (
          <VerifyCodeForm
            email={pendingEmail}
            onSubmit={handleVerify}
            onResend={handleResendCode}
            loading={loading}
            error={error}
          />
        )}
        {mode === 'forgot' && (
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBack={() => switchMode('signin')}
            loading={loading}
            error={error}
            success={forgotSuccess}
          />
        )}

        {/* Switch mode link — скрываем на шагах verify и forgot */}
        {mode !== 'verify' && mode !== 'forgot' && (
          <div className="text-center mt-6">
            <span className="font-outfit font-normal text-base text-primary-dark opacity-60">
              {mode === 'signin' ? 'not a member? ' : 'already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="font-outfit font-normal text-base text-primary-dark hover:opacity-100 transition-opacity underline"
            >
              {mode === 'signin' ? 'Sign up now' : 'Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthForm
