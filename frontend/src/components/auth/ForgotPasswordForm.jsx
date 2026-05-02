import { useState } from 'react'

const ForgotPasswordForm = ({ onSubmit, onBack, loading, error, success }) => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(email)
  }

  if (success) {
    return (
      <div className="space-y-6">
        <p className="font-outfit text-sm text-primary-dark opacity-70">
          If this email is registered, you will receive a password reset link shortly.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors"
        >
          BACK TO SIGN IN
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="font-outfit text-sm text-primary-dark opacity-70">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <div>
        <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
          EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      {error && <div className="font-outfit text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'SEND RESET LINK'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="font-outfit font-normal text-xs text-primary-dark opacity-60 hover:opacity-100 transition-opacity underline"
        >
          Back to sign in
        </button>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
