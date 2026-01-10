import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login } from '@/api'
import { useAuthStore } from '@/store'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const AuthForm = () => {
  const navigate = useNavigate()
  const { login: saveAuth } = useAuthStore()

  const [mode, setMode] = useState('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      saveAuth(result.data.access_token, formData.email)
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

      const loginResult = await login(formData.email, formData.password)

      if (!loginResult.success) {
        setError('Registration successful! Please sign in.')
        setMode('signin')
        setLoading(false)
        return
      }

      saveAuth(loginResult.data.access_token, formData.email)
      navigate('/')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
  }

  return (
    <div className="max-w-[400px]">
      {/* Mode Switcher */}
      <div className="flex gap-8 mb-12">
        <button
          onClick={() => switchMode('signin')}
          className={`font-outfit text-[45px] font-semibold transition-colors relative ${
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
          className={`font-outfit text-[45px] font-semibold transition-colors relative ${
            mode === 'signup' ? 'text-primary-dark' : 'text-gray-400'
          }`}
        >
          SIGN UP
          {mode === 'signup' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-dark"></div>
          )}
        </button>
      </div>

      {/* Form Container */}
      <div className="border-2 border-primary-dark rounded-2xl p-8 bg-primary-beige">
        {mode === 'signin' ? (
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        ) : (
          <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
        )}

        {/* Switch mode link */}
        <div className="text-center mt-6">
          <span className="font-outfit font-normal text-xs text-primary-dark opacity-60">
            {mode === 'signin' ? 'not a member? ' : 'already have an account? '}
          </span>
          <button
            type="button"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-outfit font-normal text-xs text-primary-dark hover:opacity-100 transition-opacity underline"
          >
            {mode === 'signin' ? 'Sign up now' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
