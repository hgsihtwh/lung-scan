import { useState, useEffect } from 'react'

const RESEND_COOLDOWN = 60

const VerifyCodeForm = ({ email, onSubmit, onResend, loading, error }) => {
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(code)
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setCooldown(RESEND_COOLDOWN)
    onResend()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="font-outfit font-normal text-sm text-primary-dark opacity-70 mb-6">
          We sent a 6-digit code to{' '}
          <span className="opacity-100 font-medium">{email}</span>
        </p>

        <label className="block font-outfit font-normal text-[18px] text-primary-dark mb-2">
          VERIFICATION CODE
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 rounded-full font-outfit text-base text-center tracking-[0.5em] focus:outline-none transition-colors"
          style={{
            backgroundColor: '#E1DFD5',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#BEBCB3',
          }}
          required
          minLength={6}
          maxLength={6}
        />
      </div>

      {error && <div className="font-outfit text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading || code.length < 6}
        className="w-full h-12 bg-primary-navy text-primary-beige font-outfit font-normal text-base rounded-full hover:bg-primary-navyDark transition-colors disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'VERIFY'}
      </button>

      <div className="text-center">
        <span className="font-outfit font-normal text-xs text-primary-dark opacity-60">
          Didn&apos;t receive the code?{' '}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="font-outfit font-normal text-xs text-primary-dark underline disabled:opacity-40 hover:opacity-100 transition-opacity"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
        </button>
      </div>
    </form>
  )
}

export default VerifyCodeForm
