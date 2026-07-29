import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Mail, Lock, Eye, EyeOff, Inbox, ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp, resetPassword } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || (!isForgotPassword && !password.trim())) {
      showToast('Please fill all fields', 'error')
      return
    }
    setLoading(true)
    try {
      if (isForgotPassword) {
        await resetPassword(email.trim())
        setResetSent(true)
      } else if (isSignUp) {
        await signUp(email.trim(), password)
        setSignupSuccess(true)
      } else {
        await signIn(email.trim(), password)
        showToast('Welcome back!')
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center px-5 py-10 overflow-hidden bg-surface-bg">
      <div className="absolute -top-40 -left-28 w-80 h-80 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute -bottom-48 -right-28 w-96 h-96 rounded-full bg-primary/15 blur-[110px]" />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#ff4c50] to-[#d71920] flex items-center justify-center shadow-[0_18px_50px_rgba(255,59,63,.32)] mb-5">
            <CheckCircle2 size={44} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-[34px] font-bold tracking-[-0.04em] text-dark">Attendance</h1>
          <p className="text-sm text-dark-60">by <span className="text-dark font-semibold">Smart<span className="text-[#8177ff]">CR</span></span></p>
          <h2 className="text-2xl font-bold text-dark mt-8">Welcome back! 👋</h2>
          <p className="text-dark-60 mt-2">Sign in to continue tracking attendance.</p>
        </div>

        <div className="premium-card rounded-[28px] p-6 sm:p-8">
          {signupSuccess ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <Inbox size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">Check your email</h2>
              <p className="text-dark-60 text-sm mb-6 leading-relaxed">
                We've sent a verification link to <br/><span className="text-dark font-medium">{email}</span>. <br/>Please verify your email to continue.
              </p>
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => {
                  setSignupSuccess(false)
                  setIsSignUp(false)
                  setPassword('')
                }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : resetSent ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <Mail size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">Reset link sent</h2>
              <p className="text-dark-60 text-sm mb-6 leading-relaxed">
                We've sent a password reset link to <br/><span className="text-dark font-medium">{email}</span>.
              </p>
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => {
                  setResetSent(false)
                  setIsForgotPassword(false)
                  setPassword('')
                }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              {isForgotPassword && (
                <button 
                  onClick={() => setIsForgotPassword(false)}
                  className="flex items-center text-sm text-dark-60 hover:text-primary transition-fast mb-4"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back
                </button>
              )}
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-dark">
                  {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="text-sm text-dark-60 mt-1">
                  {isForgotPassword 
                    ? 'Enter your email to receive a reset link' 
                    : 'Enter your credentials to continue'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-dark-60 mb-1.5 ml-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full h-12 pl-11 pr-4 bg-surface-bg border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
                      required
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                      <label className="block text-sm font-semibold text-dark-60">Password</label>
                      {!isSignUp && (
                        <button 
                          type="button" 
                          onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-primary hover:text-primary-hover transition-fast"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-60" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 pl-11 pr-11 bg-surface-bg border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-60 hover:text-primary transition-fast p-1"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              {!isForgotPassword && (
                <>
                <div className="flex items-center gap-4 my-7 text-dark-30 text-xs"><span className="h-px bg-border flex-1"/><span>or continue with</span><span className="h-px bg-border flex-1"/></div>
                <button type="button" className="w-full h-12 rounded-xl border border-border bg-surface-muted hover:border-primary/40 text-dark font-medium flex items-center justify-center gap-2 transition-all">
                  <GraduationCap size={19} className="text-primary" /> Sign in with University SSO
                </button>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-dark-60 hover:text-primary transition-fast"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
                </>
              )}
            </>
          )}
        </div>
        <p className="text-center text-xs text-dark-60 mt-6 flex items-center justify-center gap-2"><CheckCircle2 size={15} className="text-primary"/> Secure • Private • University Trusted</p>
      </div>
    </div>
  )
}
